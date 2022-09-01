const roleTypes = require('role.types');
const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');

module.exports = {
  cleanCreepMemory: function () {
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        // If the creep in-memory no longer exists in-game, let's wipe the memory for it.
        delete Memory.creeps[name];
        console.log(`Cleared vacant creep memory for: ${name}`);
      }
    }
  },

  ensureCreepMinimum: function (role, minCreeps) {
    const parts = [WORK, CARRY, MOVE];
    const creepsOfType = _.filter(Game.creeps, (creep) => creep.memory.role === role);
    if (creepsOfType.length < minCreeps) {
      const creepName = role.substr(0, 1).toUpperCase() + role.substr(1) + Game.time;
      const spawnResult = Game.spawns['MainSpawn'].spawnCreep(
        parts,
        creepName,
        {
          memory: {
            role: role
          }
        }
      );
      if (spawnResult === OK) {
        console.log(`Spawning creep (name: ${creepName}, role: ${role}, cost: ${this.calculateCost(parts)})`);
      }
    }
  },

  performCreepRoles: function () {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      switch (creep.memory.role) {
        case roleTypes.HARVESTER:
          roleHarvester.run(creep);
          break;
        case roleTypes.UPGRADER:
          roleUpgrader.run(creep);
          break;
      }
    }
  },

  calculateCost: function(parts) {
    return _.sum(parts, p => BODYPART_COST[p]);
  }
};