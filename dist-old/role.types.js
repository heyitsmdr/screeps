/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.types');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
  BASIC: 'basic',
  HARVESTER: 'harvester',
  UPGRADER: 'upgrader',

  BODY_PARTS: {
    'basic': [WORK, CARRY, MOVE]
  }
};