module.exports = {
  displaySpawnIndicator: function () {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];

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
  }
};