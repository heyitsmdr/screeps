/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('vfx');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
  displaySpawnIndicator: function (spawnName) {
    const spawn = Game.spawns[spawnName];
    if (spawn.spawning) {
      const spawningCreep = Game.creeps[spawn.spawning.name];
      const room = spawn.room;
      room.visual.text(
        '�️' + spawningCreep.memory.role,
        spawn.pos.x + 1,
        spawn.pos.y,
        {
          align: 'left',
          opacity: 0.8
        }
      );
    }
  }
};