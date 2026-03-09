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
- Apply player-controlled movement intent (left / right / up / down)
- Trigger player actions (torch toggle) via input

DEPENDENCIES:
- player object: {x, y, w, h, vy, power}
- Input state (keyIsDown / keyPressed handlers)
- Power system for action gating (e.g. torch usage)

USAGE:
const playerSystem = createPlayerSystem(player);
engine.register(playerSystem);
========================================
NOTES:
- Player movement intent is applied before physics resolution
- Player system does not resolve collisions
========================================
TODO / LIMITATIONS:
- Horizontal movement has no acceleration or friction
- No advanced movement states yet
========================================
*/

//======================================
// PLAYER SYSTEM
//======================================
import { PLAYER } from '../config.js';

export function createPlayerSystem(player) {
  return {
    update(deltaTime) {
      // Apply drag
      player.velocity.x *= PLAYER.DRAG;
      player.velocity.y *= PLAYER.DRAG;

      // Apply acceleration based on intent
      if (player.moveIntent.right) {
        player.velocity.x += PLAYER.ACCELERATION;
        player.facing = 1;
      }
      if (player.moveIntent.left) {
        player.velocity.x -= PLAYER.ACCELERATION;
        player.facing = -1;
      }
      if (player.moveIntent.up) {
        player.velocity.y -= PLAYER.ACCELERATION;
      }
      if (player.moveIntent.down) {
        player.velocity.y += PLAYER.ACCELERATION;
      }

      // Clamp velocity
      const maxSpeed = PLAYER.MOVE_SPEED / 60;
      player.velocity.x = constrain(player.velocity.x, -maxSpeed, maxSpeed);
      player.velocity.y = constrain(player.velocity.y, -maxSpeed, maxSpeed);
    },
  };
}

//======================================
// END
//======================================