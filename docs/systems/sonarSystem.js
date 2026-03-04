/**
========================================
VERSION: 4.0
SYSTEM: SONAR SYSTEM
AUTHOR: Ben Mounce
DESCRIPTION:
- Emits a sonar pulse from the player that travels outward 
  in rays and momentarily reveals walls and other environmental
  objects touched by the pulse. Intended as a gameplay aid 
  to reveal hidden routes and optionally alert enemies

RULES:
- Rendering code must not modify game state; rendering should
  only read from entities and systems
- All timing or state-updates must happen in update functions,
  do not perform logic inside draw/render functions
- Timing must be frame-rate independent and always pass 
deltaTime to update functions so fades and lifetimes behave 
  consistently
========================================
DESIGN GOALS:
- Provide a simple, testable Pulse implementation that emits
  multiple rays from a given origin and notifies the intersected
  walls through wall.illuminate()
- Keep pulse logic separate from rendering and input handling.
  The pulse exposes update(dt) and show(). Input should 
  trigger, creating a pulse instance when the player requests
  a ping
========================================
RESPONSIBILITIES:
- Produce rays/particles that move outward from an origin
- Detect intersections with axis-aligned rectangular walls 
  and call wall.illuminate() when a collision occurs
- Manage individual particle lifetimes and provide isFinished()
  to allow higher-level code to dispose of completed pulses
========================================
DEPENDENCIES:
- Walls array in scope as each wall should have x,y,w,h, and 
an optional illuminate() method
- p5.js vector helpers and drawing helpers if using the 
  existing show() implementation
- deltaTime passed to update(dt) should be in milliseconds
========================================
USAGE:
- Create a pulse at the player's position when the player pings:
const pulse = new Pulse(player.x, player.y);
- In the engine loop:
pulse.update(deltaTime);
pulse.show();
if (pulse.isFinished()) { // remove pulse // }
========================================
NOTES:
- The implementation uses a configurable number of rays and 
  a speed multiplier; adjust these for performance/visual 
  tradeoffs
- Particle life is represented as an alpha from 0 -> 255 and
  decays using deltaTime to remain frame-rate independent
========================================
TODO / LIMITATIONS:
- No built-in audio, or enemy alerting
========================================
**/

//======================================
// SONAR SYSTEM
//======================================
import { SONAR } from '../config.js';

const RAY_COUNT = 360;
const RAY_SPEED = 0.2;
const RAY_DECAY = 0.18;
const RAY_LIFETIME = 255;

export function createSonarSystem(player, getWalls) {
  let pulses = [];
  let cooldownTimer = 0;

  return {
    update(dt) {
      if (cooldownTimer > 0) {
        cooldownTimer -= dt;
      }

      if (player.intent.emitSonar) {
        if (cooldownTimer <= 0) {
          const px = player.getX();
          const py = player.getY();
          pulses.push(new Pulse(px, py));
          cooldownTimer = SONAR.COOLDOWN_MS;
        }
        player.intent.emitSonar = false;
      }

      // Update active pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].update(dt, getWalls());
        if (pulses[i].isFinished()) {
          pulses.splice(i, 1);
        }
      }
    },
    draw() {
      push();
      for (let pulse of pulses) {
        pulse.show();
      }
      pop();
    },
    getCooldownPercent() {
      if (cooldownTimer <= 0) return 0;
      return cooldownTimer / SONAR.COOLDOWN_MS;
    }
  };
}

class Pulse {
  constructor(x, y) {
    this.particles = [];
  
    for (let i = 0; i < RAY_COUNT; i++) {
      const angle = radians(i * (360 / RAY_COUNT));
      this.particles.push({
        pos: createVector(x, y),
        vel: p5.Vector.fromAngle(angle).mult(RAY_SPEED),
        life: RAY_LIFETIME,
      });
    }
  }

  update(dt, walls) {
    const wallsList = walls || [];

    for (let p of this.particles) {
      if (p.life <= 0) {
        continue;
      }

      p.life -= RAY_DECAY * dt;

      // find next position
      const nextX = p.pos.x + p.vel.x * dt;
      const nextY = p.pos.y + p.vel.y * dt;

      let hasCollided = false;
      // only check collisions if walls exist
      for (let wall of wallsList) {
         const wx = wall.getCornerX();
         const wy = wall.getCornerY();
         const ww = wall.getWidth();
         const wh = wall.getHeight();
         
         if (
            nextX >= wx &&
            nextX <= wx + ww &&
            nextY >= wy &&
            nextY <= wy + wh
         ) {
            // has collided
            if (wall.illuminate) {
               wall.illuminate();
            }
            hasCollided = true;
            break;
         }
      }

      // kills particle on impact
      if (hasCollided) {
        p.life = 0; 
      } else if (p.life > 0) {
        p.pos.x = nextX;
        p.pos.y = nextY;
      }
    }
  }

  show() {
    strokeWeight(2);
    for (let p of this.particles) {
      if (p.life > 0) {
        stroke(100, 200, 255, p.life);
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