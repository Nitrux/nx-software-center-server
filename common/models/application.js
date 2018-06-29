'use strict';

module.exports = function (Application) {

  Application.remoteMethod(
    'register_appimage',
    {
      accepts: [{arg: 'AppImageInfo', type: "object", description: "AppImageInfo to be uploaded."}],
      returns: [
        {arg: 'accepted', type: 'boolean'},
        {arg: 'reason', type: 'string'}
      ],
      http: {path: '/uploadAppInfo', verb: 'post'}
    }
  );

  Application.remoteMethod(
    'latestRelease',
    {
      accepts: [{arg: 'id', type: "string"}],
      returns: {arg: 'value', type: 'Release', root: true},
      http: {path: '/:id/latestRelease', verb: 'get'}
    }
  );

  Application.latestRelease = function (appId, cb) {
    Application.findOne({where: {id: appId}})
      .then((app) => {
        if (app)
          return Application.getLatestRelease(app);
        else
          return Promise.reject({'message': 'No application found with id: ' + appId, 'statusCode': 403})
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
  Application.register_appimage = function (appImageInfo, cb) {
    if (!appImageInfo) {
      return cb(null, {"accepted": false, "reason": "Empty 'AppImageInfo' field"});
    }
    if (appImageInfo['format'] === 1)
      return Application.upload_format_1_appimageinfo(appImageInfo, cb);

    return cb(null, {"accepted": false, "reason": "Unknown AppImageInfo format"});
  };

  Application.upload_format_1_appimageinfo = function (info, cb) {
    let releaseInfo = info['release'];
    delete info['release'];

    let fileInfo = info['file'];

    delete info['file'];
    delete info['type'];

    // console.log(info);
    // console.log(releaseInfo);
    // console.log(fileInfo);

    Application.findOne({where: {id: info.id}})
      .then((application) => {
        if (application)
          return Promise.resolve(application);
        else {
          console.log("Creating application: " + info['id']);
          return Application.create(info);
        }
      })
      .then((app) => {
        let t1 = Application.updateApplicationOnNewerRelease(app, info, releaseInfo);
        let t2 = Application.updateOrCreateRelease(app, releaseInfo, fileInfo);

        return Promise.all([t1, t2]);
      })
      .then((results) => {
        cb(null, {"accepted": true, "reason": "All good!"})
      }).catch((err) => {
      cb(err);
    });
  };

  Application.updateOrCreateRelease = function (app, releaseInfo, fileInfo) {
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

        return file.save()
      } else
        return release.files.create(fileInfo)
    })
  };

  Application.updateApplicationOnNewerRelease = function (application, newAppInfo, newReleaseInfo) {
    Application.getLatestRelease(application)
      .then((release) => {
        if (release) {
          if (release.date < newReleaseInfo.date) {
            for (let k in newAppInfo)
              application[k] = newAppInfo[k];

            console.log("Application info updated.");
            return application.save()
          }
        }
        return Promise.resolve();
      });
  };

  Application.getLatestRelease = function (application) {
    return application.releases.findOne({orderBy: 'date'})
  }
};
