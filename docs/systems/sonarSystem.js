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
- No built-in cooldown, audio, or enemy alerting
========================================
**/

//======================================
// SONAR SYSTEM
//======================================

export function createSonarSystem(player, getWalls) {
  let pulses = [];

  return {
    update(dt) {
      if (player.intent.emitSonar) {
        pulses.push(new Pulse(player.x, player.y));
        player.intent.emitSonar = false;
      }

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
    }
  };
}

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

  update(dt, walls) {
    for (let p of this.particles) {
      if (p.life <= 0) continue;

      p.life -= 0.2 * dt;

      const moveStep = p5.Vector.mult(p.vel, dt);
      const nextPos = p5.Vector.add(p.pos, moveStep);

      if (walls && walls.length) {
        for (let wall of walls) {
          
          if (
            nextPos.x >= wall.x &&
            nextPos.x <= wall.x + wall.w &&
            nextPos.y >= wall.y &&
            nextPos.y <= wall.y + wall.h
          ) {
            if (typeof wall.illuminate === "function") {
              wall.illuminate();
            }
            p.life = 0;
            break;
          }
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
        stroke(0, 255, 0, p.life);
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