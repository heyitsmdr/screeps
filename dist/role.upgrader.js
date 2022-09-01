// Upgrader creeps.

module.exports = {
  run: function (creep) {
    if (creep.memory.upgrading) {
      if (creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.upgrading = false;
        creep.say('� harvest');
      } else {
        const upgradeControllerResult = creep.upgradeController(creep.room.controller);
        if (upgradeControllerResult == ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    } else if (creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    } else {
      const sources = creep.room.find(FIND_SOURCES);
      const harvestResult = creep.harvest(sources[0]);
      if (harvestResult == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }
};