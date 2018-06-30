'use strict';

module.exports = function(License) {
  License.disableRemoteMethodByName('create');		// Removes (POST) /Licenses
  License.disableRemoteMethodByName('upsert');		// Removes (PUT) /Licenses
  License.disableRemoteMethodByName('deleteById');	// Removes (DELETE) /Licenses/:id
  License.disableRemoteMethodByName('updateAll');		// Removes (POST) /Licenses/update
  License.disableRemoteMethodByName('prototype.updateAttributes'); // Removes (PUT) /Licenses/:id
  License.disableRemoteMethodByName('prototype.patchAttributes');  // Removes (PATCH) /Licenses/:id
  License.disableRemoteMethodByName('createChangeStream');
};
