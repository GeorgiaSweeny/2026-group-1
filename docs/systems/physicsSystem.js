/*
========================================
VERSION: 2.4
SYSTEM: PHYSICS SYSTEM
AUTHORs: Georgia Sweeny, 
DESCRIPTION:
- Physics System: Handles collision resolution
- Updates player state such as position

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
- Resolve collisions with walls and obstacles

DEPENDENCIES:
- player object: {x, y, w, h}
- platforms array: [{x, y, w, h}]

CONFIG:

USAGE:
const physicsSystem = createPhysicsSystem(player, platforms);
engine.register(physicsSystem);
========================================
NOTES:
- Underwater physics replaced jump/gravity logic
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
/* Note from Georgia: (to be removed)

 Add your name to Author/s in header file and this section.
 Update header details with new collsion logic.
 I will add underwater physics here but it wont effect collision
 logic.

 This currently the platformer physics and collsion logic.
 It is not AABB collsion and currently uses gravity.
You should be able to remove gravity and the game should behave 
as "top-down" style as youve been working with.
I will implement the underwater physics as soon as possible though.

A good name for the collision wrapper would be --> applyCollisions();
Call all your functions in there so update(); is kept clean.

Map will be a JSON grid made of "tiles" - proably going to make
the maps with TILED https://www.mapeditor.org/. There should be documention
and online info for how people have used it in other projects which might be useful.

Write your behavior tests first, it should help when writing the functions 
- maybe we will start loving tests? xD
Add error messages if you think it would be helpful
*/


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
// UNDERWATER PHYSICS - Author: Georgia
//======================================
// ........
// underwater movement logic
//======================================
// UNDERWATER SYSTEM - END
//======================================

//======================================
// PHYSICS - UPDATE PHASE
//======================================

  return {
    update() {
      // applyUnderWaterPhysics(); <-- georgia will add this
      applyCollisions(); // <-- suggested wrapper name for collsions to live in
    }
  };
}

//======================================
// END
//======================================
