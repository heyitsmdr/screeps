export class Builder {
  private _room: Room;

  constructor(room: Room) {
    this._room = room;
  }

  private _buildExtensions(): void {
    const roomControllerLevel = this._room.controller?.level;
    if (!roomControllerLevel) {
      return;
    }

    const maxExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][roomControllerLevel];

    const extensionConstructionSites = this._room.find(FIND_CONSTRUCTION_SITES, {
      filter: (constructionSite) => constructionSite.structureType == STRUCTURE_EXTENSION
    });
    const builtExtensions = this._room.find(FIND_MY_STRUCTURES, {
      filter: (constructionSite) => constructionSite.structureType == STRUCTURE_EXTENSION
    });

    const total = extensionConstructionSites.length + builtExtensions.length;
    console.log(`Room ${this._room.name} has ${total}/${maxExtensions} extensions`);
  }

  build(): void {
    this._buildExtensions();
  }
}
