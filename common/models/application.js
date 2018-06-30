'use strict';

module.exports = function(Application) {
  Application.remoteMethod(
    'uploadAppInfo',
    {
      accepts: {
        arg: 'AppImageInfo',
        type: 'object',
        description: 'AppImageInfo to be uploaded.',
        // root: true,
      },
      returns: [
        {arg: 'accepted', type: 'boolean'},
        {arg: 'reason', type: 'string'},
      ],
      http: {path: '/uploadAppInfo', verb: 'post'},
    }
  );

  Application.remoteMethod(
    'latestRelease',
    {
      accepts: [{arg: 'id', type: 'string'}],
      returns: {arg: 'value', type: 'Release', root: true},
      http: {path: '/:id/latestRelease', verb: 'get'},
    }
  );

  Application.remoteMethod(
    'search',
    {
      accepts: [
        {arg: 'query', type: 'string'},
        {arg: 'category', type: 'string'},
      ],
      returns: {arg: 'value', type: '[Application]', root: true},
      http: {path: '/search', verb: 'get'},
    }
  );

  Application.search = function(query, category, cb) {
    let ApplicationTextsBlob = this.app.models.ApplicationTextsBlob;

    let whereField = {};
    if (query) {
      let queryPattern = new RegExp(query, 'i');
      whereField.text = {regexp: queryPattern};
    }

    if (category) {
      let categoryPattern = new RegExp(category, 'i');
      whereField.categories = {regexp: categoryPattern};
    }

    ApplicationTextsBlob.find({
      where: whereField,
      fields: {'text': false, 'applicationId': true, id: true},
      include: {relation: 'application'},
      limit: 32,
    }).then((results) => {
      let applications = [];
      results.forEach(function(result) {
        let r = result.toJSON();

        applications.push(r.application);
      });

      cb(null, applications);
    }).catch((err) => {
      cb(err);
    });
  };

  Application.latestRelease = function(appId, cb) {
    Application.findOne({where: {id: appId}})
      .then((app) => {
        if (app)
          return Application.getLatestRelease(app);
        else
          return Promise.reject({'message': 'No application found with id: ' + appId, 'statusCode': 403});
      })
      .then((release) => {
        if (release)
          cb(null, {'release': release});
        else
          Promise.reject({'message': 'No releases found for: ' + appId, 'statusCode': 403});
      }).catch((err) => {
        cb(err);
      });
  };

  Application.uploadAppInfo = function(appImageInfo, cb) {
    if (!appImageInfo) {
      return cb(null, {'accepted': false, 'reason': "Empty 'AppImageInfo' field"});
    }
    if (appImageInfo['format'] === 1)
      return Application.upload_format_1_appimageinfo(appImageInfo, cb);

    return cb(null, {'accepted': false, 'reason': 'Unknown AppImageInfo format'});
  };

  Application.l10nFieldConcat = function(obj) {
    let blob = '';
    if (obj) {
      let values = Object.values(obj);
      for (let i in values)
        blob += ' ' + values[i];
    }

    return blob;
  };

  Application.observe('after save', function createApplicationTextBlob(ctx, next) {
    if (ctx.instance) {
      let ApplicationTextsBlob = Application.app.models.ApplicationTextsBlob;
      let i = ctx.instance;

      let textsBlob = '';

      textsBlob += Application.l10nFieldConcat(i['name']);
      textsBlob += Application.l10nFieldConcat(i['keywords']);
      textsBlob += Application.l10nFieldConcat(i['abstract']);
      textsBlob += Application.l10nFieldConcat(i['description']);

      if (i['developer'])
        textsBlob += ' ' + i['developer']['name'];

      let categoriesBlob = '';
      if (i['categories'])
        categoriesBlob = i['categories'].join(' ');

      ApplicationTextsBlob.findOne({where: {applicationId: i.id}})
        .then((result) => {
          if (result) {
            result['text'] = textsBlob;
            result['categories'] = categoriesBlob;
            console.log('Text Blob updated: ', textsBlob);
            return result.save();
          } else {
            console.log('Text Blob created for: ', i.id);
            return ApplicationTextsBlob.create(
              {text: textsBlob,
                applicationId: i.id,
                categories: categoriesBlob}
                );
          }
        }).catch((err) => {
          console.error(err);
        });
    }

    next();
  });

  Application.observe('before delete', function removeApplicationTextBlob(ctx, next) {
    if (ctx.where.id) {
      let ApplicationTextsBlob = Application.app.models.ApplicationTextsBlob;
      ApplicationTextsBlob.remove({applicationId: ctx.where.id})
        .then((result) => {
          if (result.count > 0)
            console.log('Text Blob deleted for :', ctx.where.id);
        });
    }

    next();
  });

  Application.upload_format_1_appimageinfo = function(info, cb) {
    let releaseInfo = info['release'];
    delete info['release'];

    let fileInfo = info['file'];

    delete info['file'];
    delete info['type'];

    Application.findOne({where: {id: info.id}})
      .then((application) => {
        if (application)
          return Promise.resolve(application);
        else {
          console.log('Creating application: ' + info['id']);
          return Application.create(info);
        }
      })
      .then((app) => {
        let t1 = Application.updateApplicationOnNewerRelease(app, info, releaseInfo);
        let t2 = Application.updateOrCreateRelease(app, releaseInfo, fileInfo);

        return Promise.all([t1, t2]);
      })
      .then((results) => {
        cb(null, {'accepted': true, 'reason': 'All good!'});
      }).catch((err) => {
        cb(err);
      });
  };

  Application.updateOrCreateRelease = function(app, releaseInfo, fileInfo) {
    let releaseFind = null;
    if (releaseInfo['version'])
      releaseFind = app.releases.findOne({where: {version: releaseInfo.version}});
    else
      releaseFind = app.releases.findOne({where: {date: releaseInfo.date}});

    releaseFind.then((release) => {
      if (release)
        return Promise.resolve(release);
      else
        return app.releases.create(releaseInfo);
    }).then((release) => {
      let findFile = release.files.findOne({where: {url: fileInfo.url}});
      return Promise.all([findFile, release]);
    }).then((results) => {
      let file = results[0];
      let release = results[1];

      if (file) {
        for (let k in fileInfo)
          file[k] = fileInfo[k];

        return file.save();
      } else
        return release.files.create(fileInfo);
    });
  };

  Application.updateApplicationOnNewerRelease = function(application, newAppInfo, newReleaseInfo) {
    Application.getLatestRelease(application)
      .then((release) => {
        if (release) {
          if (release.date < newReleaseInfo.date) {
            for (let k in newAppInfo)
              application[k] = newAppInfo[k];

            console.log('Application info updated.');
            return application.save();
          }
        }
        return Promise.resolve();
      });
  };

  Application.getLatestRelease = function(application) {
    return application.releases.findOne({orderBy: 'date'});
  };

  Application.disableRemoteMethodByName('create');
  Application.disableRemoteMethodByName('upsert');
  Application.disableRemoteMethodByName('upsertWithWhere');
  Application.disableRemoteMethodByName('replaceById');
  Application.disableRemoteMethodByName('replaceOrCreate');
  Application.disableRemoteMethodByName('deleteById');
  Application.disableRemoteMethodByName('updateAll');
  Application.disableRemoteMethodByName('prototype.replaceAttributes');
  Application.disableRemoteMethodByName('prototype.updateAttributes');
  Application.disableRemoteMethodByName('prototype.patchAttributes');
  Application.disableRemoteMethodByName('createChangeStream');

  Application.disableRemoteMethodByName('prototype.__create__releases');
  Application.disableRemoteMethodByName('prototype.__delete__releases');
  Application.disableRemoteMethodByName('prototype.__destroyById__releases');
  Application.disableRemoteMethodByName('prototype.__updateById__releases');
};
