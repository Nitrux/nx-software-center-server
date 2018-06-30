'use strict';

module.exports = function(File) {
  File.disableRemoteMethodByName('update');
  File.disableRemoteMethodByName('upsert');
  File.disableRemoteMethodByName('upsertWithWhere');
  File.disableRemoteMethodByName('replaceOrCreate');
  File.disableRemoteMethodByName('create');

  File.disableRemoteMethodByName('prototype.updateAttributes');
  File.disableRemoteMethodByName('replaceById');
  File.disableRemoteMethodByName('deleteById');
};
