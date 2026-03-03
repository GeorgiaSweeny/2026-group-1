/*
========================================
VERSION: 4.0
SYSTEM: PHYSICS SYSTEM (SUBMARINE MODE)
AUTHORS: Georgia - Inital setup, 
         Archie - Refactored for submarine physics
DESCRIPTION:
- Physics System: Handles submarine-style movement with momentum and drag
- Implements friction, velocity damping, and wall collision with bounce
- No gravity - free 360° movement in underwater environment

RULES:
- No rendering or drawing in update functions
- Does not modify other systems directly
- Purely updates entity state based on physics

DESIGN GOALS:
- Submarine feels "floaty" with momentum
- Smooth deceleration when no input
- Wall collisions cause bounce based on velocity
- Simple, readable implementation

RESPONSIBILITIES:
- Apply drag/friction to velocity
- Resolve collisions with room boundaries (walls)
- Bounce player off walls based on velocity
- Update player position based on velocity

DEPENDENCIES:
- player object: {x, y, w, h, vx, vy}
- room dimensions: {width, height}
- Configuration: drag, bounceDamping

CONFIG:
- drag (0-1): velocity damping per frame (default 0.92)
- bounceDamping (0-1): velocity reduction on wall hit (default 0.5)
- minVelocity: threshold below which velocity becomes 0

USAGE:
const physicsSystem = createPhysicsSystem(player, () => currentRoom);
engine.register(physicsSystem);
========================================
NOTES:
- Player.vx and player.vy represent velocity (momentum)
- PlayerSystem adds to velocity, PhysicsSystem applies it to position
- Wall collision uses AABB (axis-aligned bounding box) detection
- Bounce direction reverses velocity component perpendicular to wall
========================================
*/

//======================================
// PHYSICS SYSTEM
//======================================

//======================================
// SUBMARINE PHYSICS SYSTEM
//======================================
import { PLAYER } from '../config.js';
import { CANVAS } from '../config.js';

export function createPhysicsSystem(
  player, 
  roomStateGetter,
  { 
    drag = PLAYER.DRAG,         
    bounceDamping = PLAYER.BOUNCE_DAMPING,   
    minVelocity = PLAYER.MIN_VELOCITY      
  } = {}
) {
  const getRoomState = typeof roomStateGetter === 'function' ? roomStateGetter : () => roomStateGetter;

  function getPlayerDimensions() {
    const width = player.w ?? player.size ?? PLAYER.WIDTH;
    const height = player.h ?? player.size ?? PLAYER.HEIGHT;
    return { width, height };
  }

//======================================
  // MOMENTUM & DRAG
  //======================================
  function applyDrag() {
    // Apply friction/water resistance
    player.vx *= drag;
    player.vy *= drag;

    // Stop tiny movements (prevents endless drift)
    if (Math.abs(player.vx) < minVelocity) player.vx = 0;
    if (Math.abs(player.vy) < minVelocity) player.vy = 0;
  }

  function applyVelocity() {
    // Update position based on velocity
    player.x += player.vx;
    player.y += player.vy;
  }

  //======================================
  // WALL COLLISION & BOUNCE
  //======================================

  // Currently assumes wall = screen edges, will be refactored to use room data for actual walls/obstacles


  function checkWallCollisions(roomWidth, roomHeight) {

    // TODO!!: Refactor to use room dimensions and actual wall data instead of canvas edges

    // const room = getRoom();
    // if (!room) return;

    // const roomWidth = room.width * room.tilewidth;
    // const roomHeight = room.height * room.tileheight;

    // const halfW = player.w / 2;
    // const halfH = player.h / 2;


    const { width, height } = getPlayerDimensions();
    const halfW = width / 2;
    const halfH = height / 2;
    
    // Left wall
    if (player.x - halfW < 0) {
      player.x = halfW;
      player.vx = Math.abs(player.vx) * bounceDamping; // Bounce right
    }

    // Right wall
    if (player.x + halfW > roomWidth) {
      player.x = roomWidth - halfW;
      player.vx = -Math.abs(player.vx) * bounceDamping; // Bounce left
    }

    // Top wall
    if (player.y - halfH < 0) {
      player.y = halfH;
      player.vy = Math.abs(player.vy) * bounceDamping; // Bounce down
    }

    // Bottom wall
    if (player.y + halfH > roomHeight) {
      player.y = roomHeight - halfH;
      player.vy = -Math.abs(player.vy) * bounceDamping; // Bounce up
    }
  }

  //======================================
  // OBSTACLE COLLISION (PLATFORMS)
  //======================================
  function checkObstacleCollisions(obstacles) {
    if (!obstacles || obstacles.length === 0) return;

    const { width: playerW, height: playerH } = getPlayerDimensions();

    for (const obs of obstacles) {
      const obsW = obs.w ?? obs.width ?? 0;
      const obsH = obs.h ?? obs.height ?? 0;
      if (!obsW || !obsH) continue;

      // AABB collision detection
      const playerLeft = player.x - playerW / 2;
      const playerRight = player.x + playerW / 2;
      const playerTop = player.y - playerH / 2;
      const playerBottom = player.y + playerH / 2;

      const obsLeft = obs.x - obsW / 2;
      const obsRight = obs.x + obsW / 2;
      const obsTop = obs.y - obsH / 2;
      const obsBottom = obs.y + obsH / 2;

      const isColliding = 
        playerRight > obsLeft &&
        playerLeft < obsRight &&
        playerBottom > obsTop &&
        playerTop < obsBottom;

      if (isColliding) {
        // Calculate overlap on each axis
        const overlapLeft = playerRight - obsLeft;
        const overlapRight = obsRight - playerLeft;
        const overlapTop = playerBottom - obsTop;
        const overlapBottom = obsBottom - playerTop;

        // Find smallest overlap (penetration depth)
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        // Push player out and bounce
        if (minOverlap === overlapLeft) {
          player.x -= overlapLeft;
          player.vx = -Math.abs(player.vx) * bounceDamping;
        } else if (minOverlap === overlapRight) {
          player.x += overlapRight;
          player.vx = Math.abs(player.vx) * bounceDamping;
        } else if (minOverlap === overlapTop) {
          player.y -= overlapTop;
          player.vy = -Math.abs(player.vy) * bounceDamping;
        } else if (minOverlap === overlapBottom) {
          player.y += overlapBottom;
          player.vy = Math.abs(player.vy) * bounceDamping;
        }
      }
    }
  }

  //======================================
  // PHYSICS - UPDATE PHASE
  //======================================
  return {
    update() {
      const roomState = getRoomState?.() ?? null;
      const roomWidth = roomState?.width ?? CANVAS.WIDTH;
      const roomHeight = roomState?.height ?? CANVAS.HEIGHT;
      const obstacles = roomState?.platforms ?? [];

      applyDrag();           // Apply water resistance
      applyVelocity();       // Move player based on velocity
      checkWallCollisions(roomWidth, roomHeight); // Bounce off room boundaries
      
      // // DEBUG: Check after physics
      // console.log("After physics:", {
      //   x: player.x, 
      //   y: player.y, 
      //   vx: player.vx, 
      //   vy: player.vy
      // });

      checkObstacleCollisions(obstacles);
    }
  };
}

// TO BE ADDED: HITBOX BASED COLLISION ...

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


  // Landing collision detection
  function isLandingOnPlatform(player, platform) {
    return (
      player.x + player.w / 2 > platform.x - platform.w / 2 &&
      player.x - player.w / 2 < platform.x + platform.w / 2 &&
      player.y + player.h / 2 >= platform.y - platform.h / 2 &&
      player.y + player.h / 2 <= platform.y - platform.h / 2 + player.vy &&
      player.vy > 0
    );
  }

  // Apply gravity and collisions
  function applyGravity() {
    player.onGround = false;
    player.vy += fallSpeed;
    player.y += player.vy;


    // Platform collisions
    for (const p of getPlatforms()) {
      if (isLandingOnPlatform(player, p)) {
        player.y = p.y - p.h / 2 - player.h / 2;
        player.vy = 0;
        player.onGround = true;
        break;
      }
    }
  }
//======================================
// COLLISON SYSTEM - END
//======================================
*/

//======================================
// END
//======================================
