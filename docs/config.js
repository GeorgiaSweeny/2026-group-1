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

export const TIME = {
  fixedDeltaTime : 1 / 60,
}

//======================
// KEY CODES CONFIG
//======================
export const INPUT = {
  // MOVEMENT KEYS - function takes ascii
  // WASD ASCII
  W_KEY: 87,
  A_KEY: 65,
  S_KEY: 83,
  D_KEY: 68,
  // ARROW ASCII - can also use special keyCodes
  UP_ARROW_KEY: 38,
  DOWN_ARROW_KEY: 40,
  LEFT_ARROW_KEY:  37,
  RIGHT_ARROW_KEY: 39,
  
  // ACTION KEYS - functions take strings
  TOGGLE_TORCH_KEY: ['L', 'l'],
  SONAR_KEY: ['E', 'e'],
  FIRE_MISSILE_KEY: ['space', ' ']
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
  DEFAULT_SCALE: 3.0,  /* DEFAULT_SCALE: 3 - fits game to window size, game never cutt off due to
                                             window size being not in fullscreen (scales with window)
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
  STARTING_COINS: 10000,
  MOVE_SPEED: 260,      // Pixels per second (clamped to /60 per frame)
  ACCELERATION: 4,      // Velocity increase per frame
  DRAG: 0.9  ,         // Higher = less friction (0.9-0.95 feels good)
  BOUNCE_DAMPING: 0.5,  // Velocity kept after bounce (0.5 = half speed)
  MIN_VELOCITY: 0.1,    // Stop if slower than this
};

//======================
// POWER CONFIG
//======================
export const POWER = {
  MAX_POWER: 100,
  CURRENT_POWER: 100,
  LOW_POWER_THRESHOLD: 0.15,
  DRAIN_RATE: 1
  
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
    RADIUS: PLAYER.WIDTH * 2 + 4,
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
// GAME CONFIG
//======================
export const GAME = {
  FPS : 75,
};


//======================
// COMBAT CONFIG
//======================
export const COMBAT = {
  // Knockback is applied as: normDir * KNOCKBACK_STRENGTH * fixedDeltaTime (px/frame).
  // Must satisfy: KNOCKBACK_STRENGTH/60 * DRAG > ACCELERATION so the hit pushes the player
  // away even when they are pressing back toward the hazard.
  // PLAYER.ACCELERATION = 4, PLAYER.DRAG = 0.9 → minimum threshold = 4/0.9*60 ≈ 267.
  KNOCKBACK_STRENGTH: 400,
  KNOCKBACK_LIFT: 100,
  IFRAME_DURATION_MS: 800, // Minimum ms between consecutive hits; prevents rapid repeated damage

  // (optional: default for centralised damage via PlayerHitResponse util)
  HIT_DAMAGE: 10, //(not used: power deducted is defined per enemy and in resource mangement)

  // How long (ms) the red damage flash is visible — independent of i-frame duration
  DAMAGE_FLASH_DURATION_MS: 300,
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
