const helper = require('helper');
const roleTypes = require('role.types');
const vfx = require('vfx');

module.exports = {
  loop: function () {
    helper.cleanCreepMemory();

    helper.ensureCreepMinimum(roleTypes.HARVESTER, 2);
    helper.ensureCreepMinimum(roleTypes.UPGRADER, 2);

    vfx.displaySpawnIndicator();

    helper.performCreepRoles();
  }
}