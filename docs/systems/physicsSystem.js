/*
========================================
VERSION: 3.0
SYSTEM: PHYSICS SYSTEM
AUTHORs: Nick 
DESCRIPTION:
- Physics System: Handles vertical motion, gravity, and collision resolution
- Updates player state such as position, velocity, and onGround status

RULES:
- No rendering or drawing in update functions
- Does not modify other systems directly
- Purely updates entity state based on physics
========================================
DESIGN GOALS:
- Separate physics logic from input and rendering
- Frame-rate independent movement using deltaTime if needed
- Maintain clean boundaries between systems
========================================
RESPONSIBILITIES:
- Apply gravity to the player
- Resolve collisions

DEPENDENCIES:

USAGE:
const physicsSystem = createPhysicsSystem(...)
engine.register(physicsSystem);
========================================
NOTES:
- No friction, acceleration, or drag applied yet
- Can be extended to use deltaTime for true frame-rate independence
========================================
*/

//======================================
// PHYSICS SYSTEM - 
//======================================

import { isColliding, resolveWallCollision, Wall } from "./hitboxSystem.js";

export function createPhysicsSystem(player, platformsOrGetter) {
  const getRoomCollisionSource = typeof platformsOrGetter === 'function'
    ? platformsOrGetter
    : () => platformsOrGetter;

  //---INTERNAL FUNCTIONS---//

//======================================
// COLLISON SYSTEM - Author: Nick
//======================================

  function applyCollisions(){
    player.setNextPosition();
    const walls = resolveWalls(getRoomCollisionSource());
    for (const wall of walls) {
      const physicsWall = toPhysicsWall(wall);
      if (!physicsWall) continue;
      physicsWall.updateZones(player);
      if (isColliding(physicsWall, player)) {
        resolveWallCollision(player, physicsWall);
      }
    }
    player.movePlayer();
  }

  function resolveWalls(source){
    if (!source) return [];
    const walls = Array.isArray(source) ? source : (source.walls ?? source.platforms ?? []);
    return walls.filter(Boolean);
  }

  function toPhysicsWall(wall){
    if (!wall) return null;
    if (wall instanceof Wall) return wall;

    // Handle objects with corner + size or center + size
    if (typeof wall.getCornerX === 'function' && typeof wall.getCornerY === 'function') {
      return new Wall(wall.getCornerX(), wall.getCornerY(), wall.getWidth?.() ?? wall.w ?? wall.width ?? 0, wall.getHeight?.() ?? wall.h ?? wall.height ?? 0);
    }

    if (wall.x != null && wall.y != null && (wall.w != null || wall.width != null) && (wall.h != null || wall.height != null)) {
      const w = wall.w ?? wall.width;
      const h = wall.h ?? wall.height;
      const x = (wall.x ?? 0) - (w / 2);
      const y = (wall.y ?? 0) - (h / 2);
      return new Wall(x, y, w, h);
    }

    return null;
  }
  
//======================================
// COLLISON SYSTEM - END
//======================================

//======================================
// UNDERWATER PHYSICS 
//======================================
// ........
// underwater movement logic
// drag, bounce, acceleration
//======================================
// UNDERWATER SYSTEM - END
//======================================

//======================================
// PHYSICS - UPDATE PHASE
//======================================

  return {
    update() {
      applyCollisions();
    }
  };
}

//======================================
// END
//======================================