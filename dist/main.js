const helper = require('helper');
const roleTypes = require('role.types');
const vfx = require('vfx');
const brain = require('brain');

module.exports = {
  loop: function () {
    helper.cleanCreepMemory();

    helper.ensureCreepMinimum(roleTypes.BASIC, 4);

    vfx.displaySpawnIndicator();

    helper.performCreepRoles();
    
    for (const creepName in Game.creeps) {
      const creep = Game.creeps[creepName];
      brain.think(creep);
    }
  }
}