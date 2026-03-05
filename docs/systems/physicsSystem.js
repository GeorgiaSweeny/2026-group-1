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
