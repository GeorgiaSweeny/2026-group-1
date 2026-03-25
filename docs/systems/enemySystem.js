/*
========================================
VERSION: 1.0
SYSTEM: ENEMY SYSTEM
AUTHOR: Monal Gupta
DESCRIPTION:
- Updates crab patrol movement
- Drains power on touch
========================================
*/

import { isColliding } from './hitboxSystem.js';
import { Crab } from '../entities/crab.js';

const CRAB_CONTACT_PENALTY = 8;  // burst drain on touch
const CRAB_DRAIN_RATE = 1.0;     // continuous drain while touching

export function createEnemySystem(player, getEnemies) {
  const contactSet = new Set();
  let crabs = [];
  let initialised = false;

  // converting plain room objects into Crab instances once
  function initCrabs() {
    const raw = getEnemies ? getEnemies() : [];
    crabs = raw.map(e => new Crab(e.x, e.y, e.w, e.h, e.patrolDistance, e.speed));
    initialised = true;
  }

  function updateCrab(crab, fixedDeltaTime) {
    if (crab.pendingDestroy) return; // Skip destroyed crabs

    const step = crab.speed * fixedDeltaTime;
    crab.position.x += crab.direction * step;

    if (crab.position.x > crab.spawnX + crab.patrolDistance) {
      crab.direction = -1;
      crab.facing = -1;
    }
    if (crab.position.x < crab.spawnX - crab.patrolDistance) {
      crab.direction = 1;
      crab.facing = 1;
    }

    // keeping nextPos in sync for isColliding
    crab.nextPos.x = crab.position.x;
    crab.nextPos.y = crab.position.y;
  }

  function checkPlayerContact(crab) {
    if (isColliding(crab, player)) {
      if (!contactSet.has(crab)) {
        player.power.current = Math.max(0, player.power.current - CRAB_CONTACT_PENALTY);
        contactSet.add(crab);
      }
      player.power.drain(CRAB_DRAIN_RATE, 16);
    } else {
      contactSet.delete(crab);
    }
  }

  return {
    update(fixedDeltaTime) {
      if (!initialised) initCrabs();

      // Clean up dead crabs
      for (let i = crabs.length - 1; i >= 0; i--) {
        if (crabs[i].pendingDestroy) {
          crabs.splice(i, 1);
        }
      }

      for (const crab of crabs) {
        updateCrab(crab, fixedDeltaTime);
        checkPlayerContact(crab);
      }
    },

    getCrabs() {
      return crabs;
    }
  };
}