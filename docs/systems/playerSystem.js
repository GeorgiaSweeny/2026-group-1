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
   // returning object literals → commas between entries
   return {
      update(deltaTime) {
         const acceleration = PLAYER.ACCELERATION;

         // Horizontal/vertical movement 
         if (player.intent?.left) player.vx -= acceleration;
         if (player.intent?.right) player.vx += acceleration;
         if (player.intent?.up) player.vy -= acceleration;
         if (player.intent?.down) player.vy += acceleration;

         // Update facing direction based on horizontal velocity
         if (player.vx > 0) player.facing = 1;
         else if (player.vx < 0) player.facing = -1;
      }
   };
}

//======================================
// END
//======================================