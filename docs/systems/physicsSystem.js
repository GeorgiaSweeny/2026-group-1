/*
========================================
VERSION: 3.1
SYSTEM: PHYSICS SYSTEM
AUTHORs: Nick 
DESCRIPTION:
- Physics System: Handles collision resolution for underwater movement
- Player velocity is set by playerSystem (acceleration + drag model)
- This system applies the velocity via setNextPosition(), resolves
  wall collisions, then commits the final position via movePlayer()

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
- Resolve collisions between player and walls

DEPENDENCIES:
- hitboxSystem: isColliding, resolveWallCollision

USAGE:
const physicsSystem = createPhysicsSystem(...)
engine.register(physicsSystem);
========================================
*/

import { isColliding, resolveWallCollision } from "./hitboxSystem.js";

//======================================
// PHYSICS SYSTEM - 
//======================================

export function createPhysicsSystem(player, platformsOrGetter) {
  const getPlatforms = typeof platformsOrGetter === 'function'
    ? platformsOrGetter
    : () => platformsOrGetter;

  //---INTERNAL FUNCTIONS---//

//======================================
// COLLISON SYSTEM - Author: Nick
//======================================

  function applyCollisions(){
    player.setNextPosition();
    let walls = getPlatforms();
    for(let i in walls){
      walls[i].updateZones(player);
      if(isColliding(walls[i], player)){
        resolveWallCollision(player, walls[i]);
      }
    }
    player.movePlayer();
  }
  
//======================================
// COLLISON SYSTEM - END
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
