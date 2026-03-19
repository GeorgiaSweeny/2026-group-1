/*
========================================
MISSILE SYSTEM INTEGRATION GUIDE
VERSION: 1.0
AUTHOR: Archie Brown
========================================

QUICK START:
This guide shows how to integrate the new missile system into your game.

STEPS TO INTEGRATE:
1. Import the missile system in sketch.js
2. Create the missile system instance
3. Register it with the engine
4. Pass getMissiles to renderSystem
5. Call fire method from playerSystem

========================================
DETAILED INTEGRATION:
========================================

1. IN SKETCH.JS - Add Import:
   
   import { createMissileSystem } from './systems/missileSystem.js';

2. IN SKETCH.JS - Declare Variable:

   let missileSystem;

3. IN SKETCH.JS - Initialize System (in setup() or where other systems are created):

   missileSystem = createMissileSystem(player);
   engine.register(missileSystem);

4. IN SKETCH.JS - Update renderSystem instantiation to include getMissiles:

   renderSystem = createRenderSystem({
      player,
      getPlatforms: () => getActivePlatforms(),
      // ... other parameters ...
      getMissiles: () => missileSystem.getMissiles(),
   });

5. IN PLAYERSYSTEM.JS - Handle fired missiles (in update() method):

   // After checking other action intents, add:
   if (player.consumeAction('fireMissile')) {
      missileSystem?.fireMissile?.();
   }

========================================
FEATURES:
- Press SPACEBAR to fire missiles
- Missiles auto-target random tileset squares within 150px radius
- Missiles home toward target with 5px/frame speed
- Max 5 concurrent missiles
- Missiles disappear when reaching target or traveling 2000px

========================================
CUSTOMIZATION:
Edit these values in config.js under MISSILE section:
- WIDTH: 8 (pixel size)
- HEIGHT: 8 (pixel size)
- SPEED: 5 (pixels per frame)
- MAX_DISTANCE: 2000 (max travel distance before removal)
- TARGET_RADIUS: 150 (search radius for targets)
- MAX_CONCURRENT: 5 (max missiles at once)

========================================
FILES ADDED:
- docs/entities/missile.js (Missile entity class)
- docs/systems/missileSystem.js (Missile system)

FILES MODIFIED:
- docs/config.js (added MISSILE config and FIRE_MISSILE_KEY)
- docs/entities/player.js (added fireMissile action intent)
- docs/systems/inputSystem.js (added fire missile input handler)
- docs/systems/renderSystem.js (added missile rendering)

========================================
*/
