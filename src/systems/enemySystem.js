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
  let sourceEnemiesRef = null;

  // Keep crab instances in sync with current room enemy objects.
  function syncCrabs() {
    const raw = (getEnemies ? getEnemies() : []) ?? [];
    if (raw === sourceEnemiesRef) return;

    sourceEnemiesRef = raw;
    crabs = raw.map((e) => new Crab(e.x, e.y, e.w, e.h, e.patrolDistance, e.speed));
    contactSet.clear();
  }

  function updateCrab(crab, dtSeconds) {
    const speed = Number(crab.speed) || 0;
    const patrolDistance = Math.max(0, Number(crab.patrolDistance) || 0);

    crab.previousPos.x = crab.position.x;
    crab.previousPos.y = crab.position.y;

    let nextX = crab.position.x + crab.direction * step;
    const minX = crab.spawnX - patrolDistance;
    const maxX = crab.spawnX + patrolDistance;

    if (nextX > maxX) {
      nextX = maxX;
      crab.direction = -1;
      crab.facing = -1;
    }

    if (nextX < minX) {
      nextX = minX;
      crab.direction = 1;
      crab.facing = 1;
    }

    crab.position.x = nextX;

    // keeping nextPos in sync for isColliding
    crab.nextPos.x = crab.position.x;
    crab.nextPos.y = crab.position.y;
  }

  function checkPlayerContact(crab, deltaMs) {
    if (isColliding(crab, player)) {
      if (!contactSet.has(crab)) {
        player.power.current = Math.max(0, player.power.current - CRAB_CONTACT_PENALTY);
        contactSet.add(crab);
      }
      player.power.drain(CRAB_DRAIN_RATE, deltaMs);
    } else {
      contactSet.delete(crab);
    }
  }

  return {
    update(deltaMs) {
      syncCrabs();
      const dtSeconds = Math.max(0, (deltaMs ?? 16) / 1000);

      for (const crab of crabs) {
        updateCrab(crab, dtSeconds);
        checkPlayerContact(crab, deltaMs ?? 16);
      }
    },

    getCrabs() {
      return crabs;
    }
  };
}
