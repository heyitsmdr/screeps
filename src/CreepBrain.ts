const MOVE_COLORS = {
  HARVEST:  '#aaaaaa',
  TRANSFER: '#ffff00',
  UPGRADE:  '#00ff00'
};

export enum WORK_TYPES {
  HARVEST = "harvest",
  UPGRADE_CONTROLLER = "upgradeController"
}

export class CreepBrain {
  private _queue: Array<WORK_TYPES> = [];

  constructor() {
    // TODO: Load anything persistent from game memory.
    // if(!Memory.workQueue) {
    //   console.log('Initializing work queue');
    //   Memory.workQueue = [];
    // }

    // this._queue = Memory.workQueue;
  }

  private _addWork(work: WORK_TYPES): void {
    if (!Memory.workQueue) {
      Memory.workQueue = [];
    }

    this._queue.push(work);

    if (!_.isEqual(this._queue, Memory.workQueue)) {
      console.log(`Work queue changed: ${this._queue}`);
      Memory.workQueue = this._queue;
    }
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

  /**
   * Generates a queue of activities that need to be done, ordered
   * from smaller to highest priority.
   */
  think() {
    // Lowest priority is always upgrade controller.
    this._addWork(WORK_TYPES.UPGRADE_CONTROLLER);

    // Next, harvest until we can't anymore.
    this._addWork(WORK_TYPES.HARVEST);
  }

  /**
   * Assigns actions to a creep based on the work queue.
   * @param creep Creep to perform the work.
   */
  work(creep: Creep): void {
    let nextWork = this._queue[this._queue.length - 1];

    if (nextWork == WORK_TYPES.HARVEST && creep.store.getFreeCapacity() == 0) {
      if (this._queue.length == 1) {
        console.log(`Uh oh! Creep ${creep.name} has nothing to do!`);
        return;
      }

      nextWork = this._queue[this._queue.length - 2];
    }

    if (nextWork == WORK_TYPES.HARVEST) {
      return this._harvest(creep);
    }

    if (nextWork == WORK_TYPES.UPGRADE_CONTROLLER) {
      return this._upgradeController(creep);
    }
  }
}
