export class Repairer {
  repair(room: Room): void {
    const energizedRoomTowers = room.find(FIND_MY_STRUCTURES, {
      filter: (structure) => structure.structureType == STRUCTURE_TOWER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    });

    const roomRoadsToRepair = room.find(FIND_STRUCTURES, {
      filter: (structure) => structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax
    });

    roomRoadsToRepair.forEach(road => {
      const tower = energizedRoomTowers[0] as StructureTower;
      tower.repair(road);
    });
  }
}
