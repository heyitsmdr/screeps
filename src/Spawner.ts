import { ROLE_TYPES, GetBodyParts } from "utils/Roles";

export class Spawner {
  private _getDesiredForRole(roleType: ROLE_TYPES): number {
    return 5;
  }

  private _creepName(roleType: ROLE_TYPES): string {
    return roleType.substr(0, 1).toUpperCase() + roleType.substr(1) + Game.time;
  }

  private _calculateCost(parts: BodyPartConstant[]): number {
    return _.sum(parts, p => BODYPART_COST[p]);
  }

  private _determineSpawnRole(): ROLE_TYPES {
    return ROLE_TYPES.BASIC;
  }

  spawn(): void {
    // Just use the basic role for now.
    const role = this._determineSpawnRole();

    // Get the parts that we'll use for the role.
    const parts = GetBodyParts(role);

    // Get the creeps already using the role.
    const roleCreeps = _.filter(Game.creeps, creep => {
      return creep.memory.role == role
    });

    // Check if we need more creeps for the role.
    if (roleCreeps.length >= this._getDesiredForRole(role)) {
      return;
    }

    const creepName = this._creepName(role);
    const result = Game.spawns['MainSpawn'].spawnCreep(
      parts,
      creepName,
      {
        memory: {
          role: role,
        }
      }
    );

    if (result == OK) {
      console.log(`Spawning creep (name: ${creepName}, role: ${role}, parts: ${parts}, cost: ${this._calculateCost(parts)})`);
    }
  }
}
