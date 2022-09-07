import { repeat } from "lodash";

const MOVE_COLORS = {
  HARVEST: '#aaaaaa',
  TRANSFER: '#ffff00',
  UPGRADE: '#00ff00',
  BUILD: '#0000ff'
};

const ENERGIZED_STRUCTURES = [
  STRUCTURE_SPAWN,
  STRUCTURE_EXTENSION,
];

export type RoomWork = { [room: string]: Array<string> };

export enum WORK_TYPES {
  HARVEST = "harvest",
  UPGRADE_CONTROLLER = "upgradeController",
  BUILD_SITE = "buildSite",
  TRANSFER_ENERGY = "transferEnergy"
}

export class CreepBrain {
  private _queue:RoomWork = {};

  constructor() {
    // TODO: Load anything persistent from game memory.
    // if(!Memory.workQueue) {
    //   console.log('Initializing work queue');
    //   Memory.workQueue = [];
    // }

    // this._queue = Memory.workQueue;
  }

  private _harvest(creep: Creep): void {
    const sources = creep.room.find(FIND_SOURCES);
    const result = creep.harvest(sources[0]);
    if (result == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0], { visualizePathStyle: { stroke: MOVE_COLORS.HARVEST } });
    }
  }

  private _upgradeController(creep: Creep): void {
    if (creep.room.controller) {
      const result = creep.upgradeController(creep.room.controller);
      if (result == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: MOVE_COLORS.UPGRADE } });
      }
    }
  }

  private _buildSite(creep: Creep, site: ConstructionSite): void {
    const result = creep.build(site)
    if (result == ERR_NOT_IN_RANGE) {
      creep.moveTo(site, { visualizePathStyle: { stroke: MOVE_COLORS.BUILD } });
    }
  }

  private _transferEnergy(creep: Creep, struct: Structure): void {
    const result = creep.transfer(struct, RESOURCE_ENERGY);
    if (result == ERR_NOT_IN_RANGE) {
      creep.moveTo(struct, {
        visualizePathStyle: {
          stroke: MOVE_COLORS.UPGRADE
        }
      });
    }
  }

  /**
   * Generates a queue of activities that need to be done, ordered
   * from smallest to highest priority.
   *
   * ORDER (lowest to highest priority):
   *  - Upgrade room controller.
   *  - Harvest sources.
   *  - Transfer energy to structures that need energy.
   *  - Build construction zones.
   */
  think(room: Room) {
    if (!room.name) {
      console.log(`ERROR! Unable to think about room with no name.`);
      return;
    }

    if (!this._queue[room.name]) {
      this._queue[room.name] = [];
    }

    // Lowest priority is always upgrade controller.
    this._queue[room.name].push(WORK_TYPES.UPGRADE_CONTROLLER);

    // Next, harvest until we can't anymore.
    this._queue[room.name].push(WORK_TYPES.HARVEST);

    // Add structures that need energy.
    const nonEnergizedStructures = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        if (structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          return true;
        } else if (structure.structureType == STRUCTURE_SPAWN && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          return true;
        } else if (structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          return true;
        }

        return false;
      }
    });
    nonEnergizedStructures.forEach(struct => this._queue[room.name].push(`${WORK_TYPES.TRANSFER_ENERGY}:${struct.id}`));

    // Add constructions sites if there are any.
    const roomConstructionSites = room.find(FIND_CONSTRUCTION_SITES);
    roomConstructionSites.forEach(site => this._queue[room.name].push(`${WORK_TYPES.BUILD_SITE}:${site.id}`));

    if (!Memory.workQueue) {
      Memory.workQueue = {};
    }

    if (!_.isEqual(this._queue, Memory.workQueue)) {
      console.log(`Work queue changed: ${this._queue}`);
      Memory.workQueue = this._queue;
    }
  }

  _filterCreepQueueItem(creep: Creep, action: string): boolean {
    const baseAction = action.split(':');

    // Stop harvesting if there is no more storage room.
    if (baseAction[0] == WORK_TYPES.HARVEST && creep.store.getFreeCapacity() == 0) {
      return false;

    // Ignore site building action if site building would not be possible.
    } else if (baseAction[0] == WORK_TYPES.BUILD_SITE) {
      const constSite = Game.getObjectById(baseAction[1] as Id<ConstructionSite>);
      if (!constSite || creep.store.getUsedCapacity() == 0) {
        return false;
      }

    // Ignore transfer energy if transferring would not be possible.
    } else if (baseAction[0] == WORK_TYPES.TRANSFER_ENERGY) {
      const struct = Game.getObjectById(baseAction[1] as Id<Structure>);
      if (!struct || creep.store.getUsedCapacity() == 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Assigns actions to a creep based on the work queue.
   * @param creep Creep to perform the work.
   */
  work(creep: Creep): void {
    let action =  creep.memory.currentTask;
    let queue = this._queue[creep.room.name];

    // Stop the action if the brain no longer requires the action to be done.
    if (action && queue.indexOf(action) == -1) {
      action = undefined;
    }

    if (!action) {
      const filteredQueue = _.filter(queue, queueItem => this._filterCreepQueueItem(creep, queueItem));
      action = filteredQueue[filteredQueue.length - 1];
    }

    const actionSections = action.split(':');

    if (creep.memory.currentTask != action) {
      creep.memory.currentTask = action;
      console.log(`Brain assigned ${creep.name} to the task: ${action}`);
    }

    if (actionSections[0] == WORK_TYPES.HARVEST) {
      this._harvest(creep);
      if (creep.store.getFreeCapacity() == 0) {
        delete creep.memory.currentTask;
      }
      return;
    }

    if (actionSections[0] == WORK_TYPES.UPGRADE_CONTROLLER) {
      this._upgradeController(creep);
      if (creep.store.getUsedCapacity() == 0) {
        delete creep.memory.currentTask;
      }
      return;
    }

    if (actionSections[0] == WORK_TYPES.BUILD_SITE) {
      const constSite = Game.getObjectById(actionSections[1] as Id<ConstructionSite>);
      if (!constSite) {
        delete creep.memory.currentTask;
        return;
      }

      this._buildSite(creep, constSite);

      // If no more energy, let's get a new task from the brain.
      if (creep.store.getUsedCapacity() == 0) {
        delete creep.memory.currentTask;
      }

      return;
    }

    if (actionSections[0] == WORK_TYPES.TRANSFER_ENERGY) {
      const struct = Game.getObjectById(actionSections[1] as Id<Structure>);
      if (!struct) {
        delete creep.memory.currentTask;
        return;
      }

      this._transferEnergy(creep, struct);

      // If no more energy, let's get a new task from the brain.
      if (creep.store.getUsedCapacity() == 0) {
        delete creep.memory.currentTask;
      }

      return;
    }
  }
}
