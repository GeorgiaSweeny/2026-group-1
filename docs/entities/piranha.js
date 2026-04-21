/*
=======================================
VERSION: 1.0
ENTITY: PIRANHA
AUTHOR: Monal Gupta
DESCRIPTION:
- Enemy : Piranha
- Floats in place until player activates sonar within detection radius
- Then slowly chases the player, then returns home
- Extends Hitbox so isColliding works directly
===================================
*/

import { Hitbox } from '../systems/hitboxSystem.js';

export class Piranha extends Hitbox {
  constructor(x, y, w = 24, h = 16, detectionRadius = 120, chaseSpeed = 0.6) {
    super(x - w / 2, y - h / 2, w, h);

    this.spawnX = x;
    this.spawnY = y;

    this.detectionRadius = detectionRadius;
    this.chaseSpeed = chaseSpeed;

    this.bobTime = Math.random() * Math.PI * 2;
    this.bobAmplitude = 4;
    this.bobFrequency = 0.8;

    this.state = 'idle';     // 'idle'| 'chase' |'return'
    this.facing = 1;

    this.nextPos = createVector(this.position.x, this.position.y);
    this.previousPos = createVector(this.position.x, this.position.y);
  }
}