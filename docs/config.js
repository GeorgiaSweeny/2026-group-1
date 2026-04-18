/*
========================================
CONFIGURATION FILE
========================================
AUTHOR: Georgia Sweeny
DESCRIPTION:
- Central place for constants and tuning values
- Define MAGIC NUMBERS here
- Easy to adjust gameplay parameters

RULES:
- Only designer-tunable constants.
- Nothing mutable, no runtime state.
- If a value changes during play, it does NOT belong in config.
- If it is initial runtime state, it belongs in the class constructor.
========================================
*/

//======================
// TIME CONFIG
//======================
// engine and systems use seconds, same clock
export const TIME = {
  fixedDeltaTime : 1 / 60,
}

//======================
// GAME CONFIG
//======================
export const GAME = {
  FPS : 75,
};

//======================
// KEY CODES CONFIG
//======================
// Only system-level shortcuts that are always active regardless of control mode.
export const INPUT = {
  TOGGLE_FULLSCREEN_KEY: 70,  // F
};

//======================
// MAIN CANVAS CONFIG
//======================
/* For a 2D pixel art platformer, a pixel grid is the standard for tilesets
and level design. 32x32 or 16x16 tiles. These sizes work best with 16:9 aspect ratios, supporting
clean scaling for modern resolutions like 640x360 or 1920x1080
Base Resolution: Use 640x360 as a base resolution for 16:9
then scale up, rather than designing in native 1080p*/
export const CANVAS = {
  WIDTH: 1920,
  HEIGHT: 1080,

  TILE_SIZE: 16
};

//======================
// CAMERA CONFIG
//======================
export const CAMERA = {
  // < 1.0 zooms out, > 1.0 zooms in
  DEFAULT_SCALE: 2.0,
  /*
   DEFAULT_SCALE: 3   (visible area: 640x360)   - very zoomed in
   DEFAULT_SCALE: 2.5 (visible area: 768x432)
   DEFAULT_SCALE: 2   (visible area: 960x540)   - balanced, world feels large, player not too small
   DEFAULT_SCALE: 1.5 (visible area: 1280x720)
   DEFAULT_SCALE: 1   (visible area: 1920x1080) - fully zoomed out, player feels small
*/                   
};

//======================
// DISPLAY CONFIG
//======================
/* The game canvas is displayed at DISPLAY resolution by default (1920x1080).
   Dev resolution matches the internal game resolution for side-by-side use. */
export const DISPLAY = {
  WIDTH: 1920,
  HEIGHT: 1080,
  DEV_WIDTH: 640,
  DEV_HEIGHT: 360,
};

//======================
// PLAYER CONFIG
//======================
export const PLAYER = {
  WIDTH: CANVAS.TILE_SIZE,
  HEIGHT: CANVAS.TILE_SIZE,
  SIZE: CANVAS.TILE_SIZE,
  START_X: CANVAS.TILE_SIZE,
  START_Y: CANVAS.TILE_SIZE,
  STARTING_COINS: 10000,  // 10000 for testing
  MOVE_SPEED: 260,        // Pixels per second (clamped to /60 per frame)
  ACCELERATION: 4,        // Velocity increase per frame
  DRAG: 0.9  ,            // Higher = less friction (0.9-0.95 feels good)
  BOUNCE_DAMPING: 0.5,    // Velocity kept after bounce (0.5 = half speed)
  MIN_VELOCITY: 0.1,      // Stop if slower than this
};

//======================
// POWER CONFIG
//======================
export const POWER = {
  MAX_POWER: 100,
  CURRENT_POWER: 100,
  LOW_POWER_THRESHOLD: 0.15,
  DRAIN_RATE: 0.5              
  /* 
   (Tested Options)
      DRAIN_RATE: 1             
      (100 power = 100s| 1 power = 1s) - very fast
      DRAIN_RATE: 0.6667 ~[2/3] 
      (100 power = 150s| 1 power = 1.5s) - fast
      DRAIN_RATE: 0.5           
      (100 power = 200s| 1 power = 2s) - feels most balanced
      DRAIN_RATE: 0.25          
      (100 power = 400s| 1 power = 4s) - very slow
   
   (Total drain calculation)
      Torch OFF	1 × 60fps × (1/60) = 1/sec	100s	1.0s
      Torch ON	1 × 1.5 × 60fps × (1/60) = 1.5/sec	~66.7s	~0.67s
*/
  
};

//======================
// TORCH CONFIG
//======================
export const TORCH = {
  RADIUS: 100,
  UPGRADE_RADIUS_BONUS: 22,
  MIN_RADIUS_WHEN_DRAINED: 50,
  FLICKER_POWER_THRESHOLD: 0.15,
  DRAIN_RATE: 1.5 // power drain rate is multipled by torch when on
};

//======================
// LIGHTING CONFIG
//======================
export const LIGHTING = {
  PLAYER_AMBIENT: {
    RADIUS: PLAYER.WIDTH * 2.5, // looks best, doesnt make easy
    BRIGHTNESS: 0.2
  }
};

//======================
// SONAR CONFIG
//======================
export const SONAR = {
  // Cooldown in seconds for readability; derived ms used by sonarSystem
  COOLDOWN: 1,
  COOLDOWN_MS: 1
};

//======================
// MISSILE CONFIG
//======================
export const MISSILE = {
  WIDTH: 8,
  HEIGHT: 8,
  SPEED: 2,
  MAX_DISTANCE: 2000,
  TARGET_RADIUS: 150,
  MAX_CONCURRENT: 5
};

//======================
// COMBAT CONFIG
//======================
export const COMBAT = {
  /*
   Knockback is applied as: normDir * KNOCKBACK_STRENGTH * fixedDeltaTime (px/frame).
   Must satisfy: KNOCKBACK_STRENGTH/60 * DRAG > ACCELERATION so the hit pushes the player
   away even when they are pressing back toward the hazard.
   PLAYER.ACCELERATION = 4, PLAYER.DRAG = 0.9 → minimum threshold = 4/0.9*60 ≈ 267.
  */
  KNOCKBACK_STRENGTH: 400,
  KNOCKBACK_LIFT: 100,
  IFRAME_DURATION_MS: 800, // Minimum ms between consecutive hits; prevents rapid repeated damage

  // How long (ms) the red damage flash is visible — independent of i-frame duration
  DAMAGE_FLASH_DURATION_MS: 300,

  // (optional: default for centralised damage via PlayerHitResponse util)
  HIT_DAMAGE: 10, // (not in use!) all damage set to this default
};

//======================
// CONTROLS CONFIG
//======================
// Each mode is a complete, independently customisable key map.
// Number values are matched against keyCode; string values against key.toLowerCase().
export const CONTROLS = {
  DEFAULT_MODE: 'wasd', // 'wasd' | 'arrows'

  MODES: {
    wasd: {
      MOVE_UP:      87,   // W
      MOVE_DOWN:    83,   // S
      MOVE_LEFT:    65,   // A
      MOVE_RIGHT:   68,   // D
      TOGGLE_TORCH: 'l',
      SONAR:        'e',
      FIRE_MISSILE: ' ',
      TOGGLE_PAUSE: 27,   // Escape
      TOGGLE_SHOP:  66,   // B
    },
    arrows: {
      MOVE_UP:      38,   // Up arrow
      MOVE_DOWN:    40,   // Down arrow
      MOVE_LEFT:    37,   // Left arrow
      MOVE_RIGHT:   39,   // Right arrow
      TOGGLE_TORCH: 'l',
      SONAR:        'e',
      FIRE_MISSILE: ' ',
      TOGGLE_PAUSE: 27,   // Escape
      TOGGLE_SHOP:  66,   // B
    },
  },
};

//======================
// HITBOX DEBUG
//======================
export const DEBUG_COLOR = {
  DRAW : false,
  WALL : "wall",
  PLAYER : "player",
  ENEMY : "enemy",
}
