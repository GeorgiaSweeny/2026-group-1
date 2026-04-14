/*
========================================
VERSION: 1.0
SYSTEM: MISSILE SYSTEM
AUTHOR: Archie Brown
DESCRIPTION:
- Manages creation, movement, and lifecycle of missiles
- Handles targeting of random tileset squares
- Updates missile positions and removes missiles when done

RULES:
- Must not directly modify player state
- Must not contain rendering logic
- Missiles are updated each frame after creation
- Missiles are removed when reaching target or exceeding max distance

DESIGN GOALS:
- Decouple missile management from player logic
- Provide simple homing missile behavior
- Enable proof of concept for future enemy AI

RESPONSIBILITIES:
- Maintain array of active missiles
- Create new missiles when requested
- Update missile positions each frame
- Remove missiles that have reached target or gone out of bounds
- Select random target squares within player radius

DEPENDENCIES:
- Player entity: for position reference
- Missile class: missile entity definition
- config: MISSILE and DISPLAY settings

USAGE:
import { createMissileSystem } from './missileSystem.js';

const missileSystem = createMissileSystem(player);
engine.register(missileSystem);
========================================
NOTES:
- Targets are random tileset squares within a specified radius
- Uses TILE_SIZE from config to align targets to grid
- Future: can be extended to target enemies instead of random squares
========================================
*/

//======================================
// MISSILE SYSTEM
//======================================
import { Missile } from '../entities/missile.js';
import { MISSILE, CANVAS } from '../config.js';

export function createMissileSystem(player) {
  const missiles = [];
  const maxConcurrentMissiles = MISSILE?.MAX_CONCURRENT ?? 5;

  function getRandomTargetInRadius() {
    const radius = MISSILE?.TARGET_RADIUS ?? 150;
    const tileSize = CANVAS?.TILE_SIZE ?? 32;

    // Generate random angle and distance
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;

    // Calculate target position
    let targetX = player.x + Math.cos(angle) * distance;
    let targetY = player.y + Math.sin(angle) * distance;

    // Snap to tileset grid
    targetX = Math.round(targetX / tileSize) * tileSize;
    targetY = Math.round(targetY / tileSize) * tileSize;

    return { x: targetX, y: targetY };
  }

  return {
    update() {
      // Handle player intent to fire missile
      if (player.consumeAction('fireMissile')) {
        this.fireMissile();
      }

      // Update all active missiles
      for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        missile.update();

        // Remove if reached target or out of bounds
        if (missile.isAtTarget() || missile.isOutOfBounds()) {
          missiles.splice(i, 1);
        }
      }
    },

    fireMissile() {
      // Don't exceed max concurrent missiles
      if (missiles.length >= maxConcurrentMissiles) {
        return false;
      }

      // Missiles are inventory-based and bought in the shop.
      if ((player?.missiles ?? 0) <= 0) {
        return false;
      }

      // Get random target within radius
      const target = getRandomTargetInRadius();

      // Create missile at player position
      const missile = new Missile(player.x, player.y, target.x, target.y);
      missiles.push(missile);
      player.missiles -= 1;
      return true;
    },

    getMissiles() {
      return missiles;
    },

    clearMissiles() {
      missiles.length = 0;
    }
  };
}

//======================================
// END
//======================================
