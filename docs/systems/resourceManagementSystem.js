/*
========================================
VERSION: 3.2
SYSTEM: RESOURCE MANAGEMENT SYSTEM
AUTHOR: Monal Gupta
DESCRIPTION:
- Handles player's resources and interactions with resource entities in the room.
- Collectables: one-shot collection with type-based handlers
- Hazards: continuous power drain while overlapping
- Handlers defined internally — sketch.js just wires systems

HIERARCHY:
- type: "resource" (main category)
  - resourceType: "power" (specific resource)
  - resourceType: "health" (specific resource)

RULES:
- Runs in update(deltaTime)
- Only processes entities with type === "resource" or gid-resolved collectables
- Delegates to internal handlers based on resourceType
- Hazard drain is continuous, not one-shot 

DESIGN GOALS:
- Decouple collision detection from item handling
- Keep all resource game logic inside this system
========================================
*/

//======================================
// RESOURCE MANAGEMENT SYSTEM
//======================================

let wasOnHazard = false;
const HAZARD_DRAIN_RATE = 1.5;       // continuous drain per frame while on hazard
const HAZARD_ENTRY_PENALTY = 10;     // instant drain on first contact

export function createResourceManagementSystem(player, roomSystem, getCollectables, getHazards) {
  const collectedEntities = new Set();

  /*======================================
  COLLECTABLE TYPE RESOLUTION
  Mirrors renderSystem's getCollectableType logic
  ======================================*/
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

  //======================================
  // COLLISION CHECK
  // Player is center-based, Tiled objects are top-left corner
  //======================================
  function checkCollision(a, b) {
    const ax = a.position.x;
    const ay = a.position.y;
    const aw = a.w;
    const ah = a.h;
    const bx = b.x + (b.w ?? b.width ?? 16) / 2;
    const by = b.y - (b.h ?? b.height ?? 16) / 2;
    const bw = b.w ?? b.width ?? 16;
    const bh = b.h ?? b.height ?? 16;
    return (
      ax - aw / 2 < bx + bw / 2 &&
      ax + aw / 2 > bx - bw / 2 &&
      ay - ah / 2 < by + bh / 2 &&
      ay + ah / 2 > by - bh / 2
    );
  }

  //======================================
  // HANDLERS
  // All resource game logic lives here, not in sketch.js
  //======================================
  const handlers = {
    power(player, item) {
      player.power.current = Math.max(
        0,
        Math.min(player.power.current + 10, player.power.maxPower)
      );
    },
    health(player, item) {
      player.power.current = Math.max(
        0,
        Math.min(player.power.current + 10, player.power.maxPower)
      );
    }
  };

  //======================================
  // HAZARD OVERLAP + DRAIN
  // Continuous drain while player is on hazard
  //======================================
function processHazards(deltaTime) {
  const hazards = getHazards ? getHazards() : [];
  
  for (const h of hazards) {
    if (checkCollision(player, h)) {
      
      // First frame of contact — apply entry penalty
      if (!wasOnHazard) {
        player.power.current = Math.max(0, player.power.current - HAZARD_ENTRY_PENALTY);
      }
      
      // Every frame of contact — continuous drain
      player.power.drain(HAZARD_DRAIN_RATE, deltaTime);
      
      wasOnHazard = true;
      player.isOnHazard = true;
      return;
    }
  }
  
  // Not on any hazard this frame
  wasOnHazard = false;
  player.isOnHazard = false;
}

  //======================================
  // COLLECTABLE COLLECTION
  // One-shot — item is added to collected set on pickup
  //======================================
  function processCollectables() {
    const collectables = getCollectables ? getCollectables() : [];
    for (const e of collectables) {
      if (collectedEntities.has(e)) continue;
      const resourceType = resolveCollectableType(e);
      if (!resourceType) continue;
      if (checkCollision(player, e)) {
        e.resourceType = resourceType;
        if (handlers[resourceType]) {
          handlers[resourceType](player, e);
        }
        collectedEntities.add(e);
      }
    }
  }

  return {
    //======================================
    // UPDATE — called by engine each frame
    //======================================
    update(deltaTime) {
      processHazards(deltaTime);
      processCollectables();
    },

    // Used by renderSystem in sketch.js to filter out collected items
    isCollected(entity) {
      return collectedEntities.has(entity);
    },

    collectEntity(entity) {
      collectedEntities.add(entity);
    },

    getUncollectedEntities(filterResourceType = null) {
      const collectables = getCollectables ? getCollectables() : [];
      return collectables.filter((e) => {
        if (collectedEntities.has(e)) return false;
        const resourceType = resolveCollectableType(e);
        if (!resourceType) return false;
        if (filterResourceType) return resourceType === filterResourceType;
        return true;
      });
    }
  };
}