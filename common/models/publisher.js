'use strict';

module.exports = function(Publisher) {
  Publisher.disableRemoteMethodByName('upsert');                               // disables PATCH /Publishers
  Publisher.disableRemoteMethodByName('find');                                 // disables GET /Publishers
  Publisher.disableRemoteMethodByName('replaceOrCreate');                      // disables PUT /Publishers
  Publisher.disableRemoteMethodByName('create');                               // disables POST /Publishers

  Publisher.disableRemoteMethodByName('prototype.updateAttributes');           // disables PATCH /Publishers/{id}
  Publisher.disableRemoteMethodByName('findById');                             // disables GET /Publishers/{id}
  Publisher.disableRemoteMethodByName('exists');                               // disables HEAD /Publishers/{id}
  Publisher.disableRemoteMethodByName('replaceById');                          // disables PUT /Publishers/{id}
  Publisher.disableRemoteMethodByName('deleteById');                           // disables DELETE /Publishers/{id}

  Publisher.disableRemoteMethodByName('prototype.__get__accessTokens');        // disable GET /Publishers/{id}/accessTokens
  Publisher.disableRemoteMethodByName('prototype.__create__accessTokens');     // disable POST /Publishers/{id}/accessTokens
  Publisher.disableRemoteMethodByName('prototype.__delete__accessTokens');     // disable DELETE /Publishers/{id}/accessTokens

  Publisher.disableRemoteMethodByName('prototype.__findById__accessTokens');   // disable GET /Publishers/{id}/accessTokens/{fk}
  Publisher.disableRemoteMethodByName('prototype.__updateById__accessTokens'); // disable PUT /Publishers/{id}/accessTokens/{fk}
  Publisher.disableRemoteMethodByName('prototype.__destroyById__accessTokens');// disable DELETE /Publishers/{id}/accessTokens/{fk}

  Publisher.disableRemoteMethodByName('prototype.__count__accessTokens');      // disable  GET /Publishers/{id}/accessTokens/count

  Publisher.disableRemoteMethodByName('prototype.verify');                     // disable POST /Publishers/{id}/verify
  Publisher.disableRemoteMethodByName('changePassword');                       // disable POST /Publishers/change-password
  Publisher.disableRemoteMethodByName('createChangeStream');                   // disable GET and POST /Publishers/change-stream

  Publisher.disableRemoteMethodByName('confirm');                              // disables GET /Publishers/confirm
  Publisher.disableRemoteMethodByName('count');                                // disables GET /Publishers/count
  Publisher.disableRemoteMethodByName('findOne');                              // disables GET /Publishers/findOne

// Publisher.disableRemoteMethodByName("login");                                // disables POST /Publishers/login
// Publisher.disableRemoteMethodByName("logout");                               // disables POST /Publishers/logout

  Publisher.disableRemoteMethodByName('resetPassword');                        // disables POST /Publishers/reset
  Publisher.disableRemoteMethodByName('setPassword');                          // disables POST /Publishers/reset-password
  Publisher.disableRemoteMethodByName('update');                               // disables POST /Publishers/update
  Publisher.disableRemoteMethodByName('upsertWithWhere');                      // disables POST /Publishers/upsertWithWhere
};
