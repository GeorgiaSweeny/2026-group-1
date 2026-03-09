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

import { isColliding, resolveWallCollision } from "./hitboxSystem.js";

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