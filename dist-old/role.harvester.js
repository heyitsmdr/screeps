// Harvester creeps.

const TRANSFER_TO_STRUCTS = [STRUCTURE_SPAWN];

module.exports = {
  run: function (creep) {
    if (creep.store.getFreeCapacity() > 0) {
      const sources = creep.room.find(FIND_SOURCES);
      const harvestResult = creep.harvest(sources[0]);
      if (harvestResult == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffffff' } });
      }
    } else {
      const structures = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (TRANSFER_TO_STRUCTS.indexOf(structure.structureType) > -1) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
      });

      if (structures.length > 0) {
        const transferResult = creep.transfer(structures[0], RESOURCE_ENERGY);
        if (transferResult == ERR_NOT_IN_RANGE) {
          creep.moveTo(structures[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  }
};