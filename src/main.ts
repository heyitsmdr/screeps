import { CreepBrain, RoomWork } from "CreepBrain";
import { ErrorMapper } from "utils/ErrorMapper";
import { Spawner } from './Spawner';

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    workQueue: RoomWork;
  }

  interface CreepMemory {
    role?: string;
    currentTask?: string;
    // room: string;
    // working: boolean;
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  //console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps.
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
      console.log(`Cleared vacant creep memory for: ${name}`);
    }
  }

  // Creep spawning management.
  const spawner = new Spawner();
  spawner.spawn();

  // Calculate work that needs to be done for each room.
  const creepBrain = new CreepBrain();
  for (const name in Game.rooms) {
    const room = Game.rooms[name];
    creepBrain.think(room);
  }

  // Tell the creeps to do work.
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    creepBrain.work(creep);
  }
});
