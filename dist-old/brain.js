"use strict";
// Creep brain.

const WORK_TYPES = {
  NONE:    0,
  HARVEST: 1
};

const MOVE_COLORS = {
  HARVEST:  '#ffffff',
  TRANSFER: '#ffff00',
  UPGRADE:  '#00ff00'
};

const ENERGY_STRUCTURE_TYPES = [
  STRUCTURE_SPAWN,
  STRUCTURE_EXTENSION
];

module.exports = {
  /**
   * 
   * @param {Room} room 
   * @returns {Structure[]}
   */
  structuresNeedingEnergy: function (room) {
    const structures = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        structure.store
        return (ENERGY_STRUCTURE_TYPES.indexOf(structure.structureType) > -1) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });

    return structures;
  },

  /**
   * 
   * @param {Creep} creep 
   */
  think: function (creep) {
    // Have capacity? Harvest.
    if (creep.store.getFreeCapacity() > 0) {
      this.harvest(creep);
      return;
    }

    // Give energy to structures needing energy.
    const structsNeedingEnergy = this.structuresNeedingEnergy(creep.room);
    if (structsNeedingEnergy.length > 0) {
      const struct = structsNeedingEnergy[0];
      this.transfer(creep, struct);
      return;
    }

    // If everything else has energy, upgrade the room controller.
    this.upgradeController(creep);
  },

  /**
   * 
   * @param {Creep} creep 
   */
  harvest: function (creep) {
    const sources = creep.room.find(FIND_SOURCES);
    const harvestResult = creep.harvest(sources[0]);
    if (harvestResult == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0], { visualizePathStyle: { stroke: MOVE_COLORS.HARVEST } });
    }
  },

  /**
   * 
   * @param {Creep} creep 
   * @param {Structure} struct
   */
  transfer: function (creep, struct) {
    const transferResult = creep.transfer(struct, RESOURCE_ENERGY);
    if (transferResult == ERR_NOT_IN_RANGE) {
      creep.moveTo(struct, { visualizePathStyle: { stroke: MOVE_COLORS.TRANSFER } });
    }
  },

  /**
   * 
   * @param {Creep} creep 
   */
  upgradeController: function (creep) {
    const upgradeControllerResult = creep.upgradeController(creep.room.controller);
    if (upgradeControllerResult == ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: MOVE_COLORS.UPGRADE } });
    }
  }
};