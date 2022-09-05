import { repeat } from "lodash";

const MOVE_COLORS = {
  HARVEST: '#aaaaaa',
  TRANSFER: '#ffff00',
  UPGRADE: '#00ff00',
  BUILD: '#0000ff'
};

export enum WORK_TYPES {
  HARVEST = "harvest",
  UPGRADE_CONTROLLER = "upgradeController",
  BUILD_SITE = "buildSite"
}

export class CreepBrain {
  private _queue: Array<string> = [];

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

  /**
   * Generates a queue of activities that need to be done, ordered
   * from smallest to highest priority.
   */
  think() {
    // Lowest priority is always upgrade controller.
    this._queue.push(WORK_TYPES.UPGRADE_CONTROLLER);

    // Next, harvest until we can't anymore.
    this._queue.push(WORK_TYPES.HARVEST);

    // Next, add constructions sites if there are any.
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      const roomConstructionSites = room.find(FIND_CONSTRUCTION_SITES);
      roomConstructionSites.forEach(site => {
        this._queue.push(
          `${WORK_TYPES.BUILD_SITE}:${site.id}`
        );
      });
    }
    if (!Memory.workQueue) {
      Memory.workQueue = [];
    }

    if (!_.isEqual(this._queue, Memory.workQueue)) {
      console.log(`Work queue changed: ${this._queue}`);
      Memory.workQueue = this._queue;
    }
  }

  /**
   * Assigns actions to a creep based on the work queue.
   * @param creep Creep to perform the work.
   */
  work(creep: Creep): void {
    let action =  creep.memory.currentTask;

    if (!action) {
      const filteredQueue = _.filter(this._queue, item => {
        const baseAction = item.split(':');
        // Stop harvesting if there is no more storage room.
        if (baseAction[0] == WORK_TYPES.HARVEST && creep.store.getFreeCapacity() == 0) {
          return false;
        // Ignore site building action if site building would not be possible.
        } else if (baseAction[0] == WORK_TYPES.BUILD_SITE) {
          const constSite = Game.getObjectById(actionSections[1] as Id<ConstructionSite>);
          if (!constSite || constSite.room?.name != creep.room.name || creep.store.getUsedCapacity() == 0) {
            return false;
          }
        }

        return true;
      });
      action = filteredQueue[filteredQueue.length - 1];
    }

    const actionSections = action.split(':');

    if (creep.memory.currentTask != action) {
      creep.memory.currentTask = action;
      console.log(`Creep ${creep.name} has been assigned the task: ${action}`);
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
      if (creep.store.getUsedCapacity() == 0) {
        delete creep.memory.currentTask;
      }
      return;
    }
  }
}
