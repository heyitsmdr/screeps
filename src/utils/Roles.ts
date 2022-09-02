export enum ROLE_TYPES {
  BASIC = "basic"
}

export function GetBodyParts(roleType: ROLE_TYPES): BodyPartConstant[] {
  switch(roleType) {
    case ROLE_TYPES.BASIC:
      return [WORK, CARRY, MOVE];
    default:
      return [];
  }
}
