/*
========================================
VERSION: 1.0
SYSTEM: SONAR SYSTEM
AUTHOR: BEN MOUNCE
DESCRIPTION:
- Experimenting with the sonar system which creates a pulse from the
  point where the user has clicked on the screen. Within the sonar area
  it reveals and then fades out the walls to the maze so the player can
  use the pulse to see where to go.

RULES:
- Render system must not modify game state
- Render system must only read from entities and systems
- No timing or logic updates in draw functions
========================================
DESIGN GOALS:
========================================
RESPONSIBILITIES:

DEPENDENCIES:

USAGE:

========================================
NOTES:
========================================
TODO / LIMITATIONS:
========================================
*/

//======================================
// SONAR SYSTEM
//======================================

//This code makes a maze from the bottom of the screen to the top, which emits a sonar pulse to uncover the route out the maze

// Pulse.js
class Pulse {
  constructor(x, y) {
    this.particles = [];
    const numRays = 360;
    this.speed = 0.2;

    for (let i = 0; i < numRays; i++) {
      const angle = radians(i);
      this.particles.push({
        pos: createVector(x, y),
        vel: p5.Vector.fromAngle(angle).mult(this.speed),
        life: 255,
      });
    }
  }

  update(dt) {
    for (let p of this.particles) {
      if (p.life <= 0) continue;

      p.life -= 0.2 * dt;

      const moveStep = p5.Vector.mult(p.vel, dt);
      const nextPos = p5.Vector.add(p.pos, moveStep);

      for (let wall of walls) {
        if (
          nextPos.x >= wall.x &&
          nextPos.x <= wall.x + wall.w &&
          nextPos.y >= wall.y &&
          nextPos.y <= wall.y + wall.h
        ) {
          if (typeof wall.illuminate === "function") wall.illuminate();

          p.life = 0;
          break;
        }
      }

      if (p.life > 0) {
        p.pos = nextPos;
      }
    }
  }

  show() {
    strokeWeight(2);
    for (let p of this.particles) {
      if (p.life > 0) {
        stroke(0, 220, 0, p.life);
        point(p.pos.x, p.pos.y);
      }
    }
  }

  isFinished() {
    return this.particles.every((p) => p.life <= 0);
  }
}

//======================================
// END
//======================================
