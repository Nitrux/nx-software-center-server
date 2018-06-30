"use strict";

module.exports = function(app) {
  let Publisher = app.models.Publisher;
  Publisher.findOne({where: {username: 'root'}})
    .then((publisher) => {
      if (publisher)
        return Promise.resolve(publisher);
      else {
        console.log(
          'Created default root user, ' +
          'CHANGE ITS PASSWORD NOW!');

        return Publisher.create({
          username: 'root',
          email: 'support@nxos.org',
          password: 'password'});
      }
    }).catch((err) => {
      console.error(err);
    });
};
