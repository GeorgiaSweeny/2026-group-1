/*
========================================
VERSION: 1.0
ENTITY: CRAB
AUTHOR: Monal Gupta
DESCRIPTION:
- Crab enemy entity
- patrols left/right or up/down between boundaries
- Extends Hitbox so isColliding works directly
========================================
*/

import { Hitbox } from '../systems/hitboxSystem.js';

export class Crab extends Hitbox {
  constructor(x, y, w = 20, h = 14, patrolDistance = 64, speed = 100, patrolAxis = 'horizontal') {
    super(x - w / 2, y - h / 2, w, h);

    // this.spawnX = x;
    // this.spawnY = y;
    this.spawnX = this.position.x;
    this.spawnY = this.position.y;
    this.patrolDistance = patrolDistance;
    this.speed = speed;
    this.direction = 1;   // 1 = right, -1 = left
    this.facing = 1;
    this.patrolAxis = patrolAxis ?? 'horizontal';

    //for isColliding
    this.nextPos = createVector(this.position.x, this.position.y);
    this.previousPos = createVector(this.position.x, this.position.y);
  }
}