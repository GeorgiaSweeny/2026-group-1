/*
========================================
VERSION: 2.4
SYSTEM: PLAYER SYSTEM
AUTHOR: Georgia Sweeny
DESCRIPTION:
- Player System: Manages player entity state and intent-based movement

RULES:
- Player system does not handle physics or collisions
- Player system does not perform rendering outside its draw hook
- Player system must not directly modify other systems
========================================
DESIGN GOALS:
- Keep player logic separate from physics resolution
- Treat input as intent, not direct movement
- Maintain clean boundaries between systems
========================================
RESPONSIBILITIES:
- Maintain player positional and state data
- Apply player-controlled movement intent (left / right)
- Trigger player actions (jump, torch toggle) via input

DEPENDENCIES:
- player object: {x, y, w, h, vy, onGround, power}
- Input state (keyIsDown / keyPressed handlers)
- Power system for action gating (e.g. torch usage)

USAGE:
const playerSystem = createPlayerSystem(player);
engine.register(playerSystem);
========================================
NOTES:
- Player movement intent is applied before physics resolution
- Jump logic depends on onGround state set by Physics System
- Player system does not resolve collisions
========================================
TODO / LIMITATIONS:
- Horizontal movement has no acceleration or friction
- No advanced movement states yet
========================================
*/

//======================
// PLAYER SYSTEM
//======================
import { PLAYER } from '../config.js';

export function createPlayerSystem(player) {
  return {
    update(deltaTime) {
      // Apply acceleration from movement intent (per-frame, no deltaTime)
      if (player.moveIntent.right) player.velocity.x += PLAYER.ACCELERATION;
      if (player.moveIntent.left) player.velocity.x -= PLAYER.ACCELERATION;
      if (player.moveIntent.up) player.velocity.y -= PLAYER.ACCELERATION;
      if (player.moveIntent.down) player.velocity.y += PLAYER.ACCELERATION;

      // Apply drag (underwater friction — closer to 1 = less friction)
      player.velocity.x *= PLAYER.DRAG;
      player.velocity.y *= PLAYER.DRAG;

      // Clamp to max speed
      player.velocity.x = constrain(player.velocity.x, -PLAYER.MAX_SPEED, PLAYER.MAX_SPEED);
      player.velocity.y = constrain(player.velocity.y, -PLAYER.MAX_SPEED, PLAYER.MAX_SPEED);

      // Update facing direction based on horizontal velocity
      if (player.velocity.x > 0.01) player.facing = 1;
      else if (player.velocity.x < -0.01) player.facing = -1;

      // Reset move intent after consumption
      player.resetMoveIntent();

      // Bubble trail — spawn behind submarine when moving
      const isMoving = Math.abs(player.velocity.x) > 0.1 || Math.abs(player.velocity.y) > 0.1;
      if (isMoving && Math.random() < 0.4) {
        const backX = player.position.x - player.facing * player.w * 0.8;
        player.bubbles.push({
          x: backX,
          y: player.position.y + (Math.random() * 8 - 4),
          size: 2 + Math.random() * 4,
          life: 200,
          vx: (Math.random() * 0.04 - 0.02),
          vy: -(0.03 + Math.random() * 0.05),
        });
      }

      // Update existing bubbles (drift upward + fade)
      for (let i = player.bubbles.length - 1; i >= 0; i--) {
        const b = player.bubbles[i];
        b.x += b.vx * deltaTime;
        b.y += b.vy * deltaTime;
        b.life -= 0.15 * deltaTime;
        if (b.life <= 0) {
          player.bubbles.splice(i, 1);
        }
      }
    },
  };
}
//======================================
// END
//======================================
