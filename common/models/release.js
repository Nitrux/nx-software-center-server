'use strict';

module.exports = function(Release) {
  Release.disableRemoteMethodByName('create');		// Removes (POST) /Releases
  Release.disableRemoteMethodByName('upsert');		// Removes (PUT) /Releases
  Release.disableRemoteMethodByName('deleteById');	// Removes (DELETE) /Releases/:id
  Release.disableRemoteMethodByName('updateAll');		// Removes (POST) /Releases/update
  Release.disableRemoteMethodByName('prototype.updateAttributes'); // Removes (PUT) /Releases/:id
  Release.disableRemoteMethodByName('prototype.patchAttributes');  // Removes (PATCH) /Releases/:id
  Release.disableRemoteMethodByName('createChangeStream');

  Release.disableRemoteMethodByName('prototype.__create__files');
  Release.disableRemoteMethodByName('prototype.__delete__files');
  Release.disableRemoteMethodByName('prototype.__destroyById__files'); // DELETE
  Release.disableRemoteMethodByName('prototype.__updateById__files'); // PUT

};
