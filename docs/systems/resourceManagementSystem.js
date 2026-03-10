/*
========================================
VERSION: 3
SYSTEM: RESOURCE MANAGEMENT SYSTEM
AUTHOR: Monal Gupta
DESCRIPTION:
- Handles player's resources and interactions with resource entities in the room.
- "resource" is the main superclass; specific types (power, health, etc) are resourceTypes.
- Extensible handler system for different resource types.
- Registers handlers that are called when items are collected.
- Does not directly handle specific game logic

HIERARCHY:
- type: "resource" (main category)
  - resourceType: "power" (specific resource)
  - resourceType: "health" (specific resource)

RULES:
- Runs in update(deltaTime)
- Delegates to registered handlers based on resourceType
- Multiple systems can register handlers for different resource types

DESIGN GOALS:
- Decouple collision detection from item handling
- Allow any system to register handlers for resource types
- Support extensible resource types (power, health, ammo, collectables, etc)

USAGE:
const resourceMgmt = createResourceManagementSystem(player, roomSystem, getCollectables);
resourceMgmt.registerHandler('power', (player, item) => {
  player.power.current = Math.min(player.power.current + item.amount, player.power.maxPower);
});
resourceMgmt.registerHandler('health', (player, item) => {
  player.health.current = Math.min(player.health.current + item.amount, player.health.maxHealth);
});

========================================
*/

//======================================
// RESOURCE MANAGEMENT SYSTEM
//======================================

export function createResourceManagementSystem(player, roomSystem, getCollectables) {
  const collectedEntities = new Set();
  // Maps resource types (power, health, etc) to handler functions
  const handlers = {};

  function resolveCollectableType(item) {
    if (item.collectableType) return item.collectableType;

    const gid = Number(item?.gid);
    if (!gid) return null;

    const tilesets = roomSystem.getTilesets?.() ?? [];
    let best = null;
    for (const ts of tilesets) {
      const firstgid = Number(ts.firstgid ?? 0);
      if (gid >= firstgid && (!best || firstgid > best.firstgid)) {
        best = { ...ts, firstgid };
      }
    }
    if (!best) return null;

    const localTileId = gid - best.firstgid;
    if (localTileId === 20) return 'power';
    if (localTileId === 41 || localTileId === 53) return 'health';
    return null;
  }

  function checkCollision(a, b) {
    const ax = a.position.x;
    const ay = a.position.y;
    const aw = a.w;
    const ah = a.h;

    const bx = b.x + b.w / 2;
    const by = b.y + b.h / 2;
    const bw = b.w ?? b.width ?? 16;
    const bh = b.h ?? b.height ?? 16;

    return (
      ax - aw / 2 < bx + bw / 2 &&
      ax + aw / 2 > bx - bw / 2 &&
      ay - ah / 2 < by + bh / 2 &&
      ay + ah / 2 > by - bh / 2
    );
  }

  function handleCollectedItem(item) {
    if (handlers[item.resourceType]) {
      handlers[item.resourceType](player, item);
    }
    collectedEntities.add(item);
  }

  return {
    /**
     * Registers a handler for a specific resource type
     * @param {string} resourceType - The resource type (e.g., 'power', 'health')
     * @param {Function} handler - Function called on collection: handler(player, item)
     */
    registerHandler(resourceType, handler) {
      if (typeof handler !== 'function') {
        console.error(`Handler for ${resourceType} must be a function`);
        return;
      }
      handlers[resourceType] = handler;
    },

    // Checks collisions and collects resources
    update() {
      const collectables = getCollectables ? getCollectables() : [];

      for (const e of collectables) {
        if (collectedEntities.has(e)) continue;

        const resourceType = resolveCollectableType(e);
        if (!resourceType) continue;

        if (checkCollision(player, e)) {
          e.resourceType = resourceType;
          //e.amount = 10;               // set here since JSON has no amount field  -->changed right now, different for health and power
          handleCollectedItem(e);
        }
      }
    },

    /**
     * Gets all uncollected resource entities
     * @param {string} filterResourceType - Optional: filter by specific resource type
     * @returns {Array} Uncollected resource entities
     */
    getUncollectedEntities(filterResourceType = null) {
      const collectables = getCollectables ? getCollectables() : [];
      return collectables.filter((e) => {
        if (collectedEntities.has(e)) return false;
        const resourceType = resolveCollectableType(e);
        if (!resourceType) return false;
        if (filterResourceType) return resourceType === filterResourceType;
        return true;
      });
    },

    /**
     * Checks if an entity has been collected
     * @param {Object} entity - The entity to check
     * @returns {boolean} Whether the entity is collected
     */
    isCollected(entity) {
      return collectedEntities.has(entity);
    },

    /**
     * Manually marks an entity as collected
     * @param {Object} entity - The entity to collect
     */
    collectEntity(entity) {
      collectedEntities.add(entity);
    }
  };
}