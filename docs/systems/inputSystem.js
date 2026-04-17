/*
========================================
VERSION: 3.0
SYSTEM: INPUT SYSTEM
AUTHOR/s: Georgia, Archie
DESCRIPTION:
- Captures player input and converts it into intent flags
- Input system separates user actions from game logic
- Movement keys are mapped via controlMode ('wasd' | 'arrows')

RULES:
- Must not directly modify game state
- Must not contain gameplay logic
- Must not perform rendering
- Only updates intent for other systems to consume
========================================
DESIGN GOALS:
- Decouple input handling from player and game logic
- Provide a simple interface for reading input states
- Enable continuous and discrete actions via intent flags
- Abstract movement actions from physical keys via controlMode
========================================
RESPONSIBILITIES:
- Listen for keyboard events (keyPressed, keyIsDown)
- Update player intent object with left/right/up/down movement
- Update player intent for discrete actions (toggle torch)
- Map controlMode to physical keys dynamically

DEPENDENCIES:
- Browser keyboard events (p5.js keyIsDown / keyPressed)

USAGE:
import { createInputSystem } from './inputSystem.js';

const inputSystem = createInputSystem(player);
engine.register(inputSystem);
========================================
NOTES:
- Intent represents desired actions, not execution
- Continuous actions (movement) use keyIsDown
- Discrete actions (jump, toggleTorch) use keyPressed
- Other systems (playerSystem, torchSystem) act on intent flags
- controlMode switches key mapping without restarting
========================================
TODO / LIMITATIONS:
- No gamepad support yet
- Only handles keyboard input
========================================
*/


//======================================
// INPUT SYSTEM
//======================================
/* Intent only, shouldn't directly manipulate anything */

import { INPUT, CONTROLS } from '../config.js'

// Movement action → key code mapping per control mode
const KEY_MAPS = {
  wasd: {
    left:  INPUT.A_KEY,
    right: INPUT.D_KEY,
    up:    INPUT.W_KEY,
    down:  INPUT.S_KEY,
  },
  arrows: {
    left:  INPUT.LEFT_ARROW_KEY,
    right: INPUT.RIGHT_ARROW_KEY,
    up:    INPUT.UP_ARROW_KEY,
    down:  INPUT.DOWN_ARROW_KEY,
  },
};

export function createInputSystem(player) {
  let controlMode = CONTROLS.DEFAULT_MODE;

  return {
    update() {
      const keys = KEY_MAPS[controlMode] ?? KEY_MAPS.wasd;
      player.moveIntent.left  = keyIsDown(keys.left);
      player.moveIntent.right = keyIsDown(keys.right);
      player.moveIntent.up    = keyIsDown(keys.up);
      player.moveIntent.down  = keyIsDown(keys.down);
    },

    onKeyPressed(key, keyCode) {
      const keyLower = typeof key === 'string' ? key.toLowerCase() : '';

      if (keyCode === INPUT.TOGGLE_PAUSE_KEY)  player.actionIntent.togglePause = true;
      if (keyCode === INPUT.TOGGLE_SHOP_KEY)   player.actionIntent.toggleShop = true;
      if (keyLower === INPUT.TOGGLE_TORCH_KEY) player.actionIntent.toggleTorch = true;
      if (keyLower === INPUT.SONAR_KEY)        player.actionIntent.emitSonar = true;
      if (keyLower === INPUT.FIRE_MISSILE_KEY) player.actionIntent.fireMissile = true;
    },

    setControlMode(mode) {
      if (mode === 'wasd' || mode === 'arrows') controlMode = mode;
    },

    getControlMode() {
      return controlMode;
    },
  };
}
//======================================
// END
//======================================
