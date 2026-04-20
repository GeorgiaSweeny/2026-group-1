/*
========================================
VERSION: 4.0
SYSTEM: INPUT SYSTEM
AUTHOR/s: Georgia, Archie
DESCRIPTION:
- Captures player input and converts it into intent flags
- All key bindings are driven by CONTROLS.MODES[controlMode] in config
- Switching controlMode instantly changes every binding

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
- All physical keys are a configurable mapping layer only
========================================
RESPONSIBILITIES:
- Listen for keyboard events (keyPressed, keyIsDown)
- Update player move intent from the active mode's movement bindings
- Update player action intent from the active mode's action bindings
- Expose setControlMode / getControlMode for settings UI

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
- Discrete actions use keyPressed / onKeyPressed
- Other systems (playerSystem, torchSystem) act on intent flags
- controlMode switches the entire key map without restarting
========================================
*/


//======================================
// INPUT SYSTEM
//======================================
/* Intent only, shouldn't directly manipulate anything */

import { CONTROLS, INPUT } from '../config.js';

// Returns true if a key event matches a binding.
// Number bindings compare against keyCode; string bindings compare against key.toLowerCase().
function matchesBinding(binding, key, keyCode) {
  if (typeof binding === 'number') return keyCode === binding;
  if (typeof binding === 'string') {
    return (typeof key === 'string' ? key.toLowerCase() : '') === binding.toLowerCase();
  }
  return false;
}

export function createInputSystem(player) {
  let controlMode = CONTROLS.DEFAULT_MODE;

  function getMap() {
    return CONTROLS.MODES[controlMode] ?? CONTROLS.MODES[CONTROLS.DEFAULT_MODE];
  }

  return {
    update() {
      const map = getMap();
      player.moveIntent.left  = keyIsDown(map.MOVE_LEFT);
      player.moveIntent.right = keyIsDown(map.MOVE_RIGHT);
      player.moveIntent.up    = keyIsDown(map.MOVE_UP);
      player.moveIntent.down  = keyIsDown(map.MOVE_DOWN);
    },

    // Unified key handler: supports both (key, keyCode) calls and simple (key) calls.
    onKeyPressed(key, keyCode) {
      const map = getMap();

      // first check mapped bindings (map values may be numbers or strings)
      if (matchesBinding(map.TOGGLE_PAUSE,  key, keyCode)) player.actionIntent.togglePause  = true;
      if (matchesBinding(map.TOGGLE_SHOP,   key, keyCode)) player.actionIntent.toggleShop   = true;
      if (matchesBinding(map.TOGGLE_TORCH,  key, keyCode)) player.actionIntent.toggleTorch  = true;
      if (matchesBinding(map.SONAR,         key, keyCode)) player.actionIntent.emitSonar    = true;
      if (matchesBinding(map.FIRE_MISSILE,  key, keyCode)) player.actionIntent.launchMissile = true;

      // fallback direct-key handling (for simple callers that pass only a key)
      const keyLower = typeof key === 'string' ? key.toLowerCase() : '';
      if (INPUT.TOGGLE_TORCH_KEY.includes(key) || keyLower === 'l') {
        player.actionIntent.toggleTorch = true;
      }
      if (INPUT.SONAR_KEY.includes(key) || keyLower === 'e') {
        player.actionIntent.emitSonar = true;
      }
      if (INPUT.MISSILE_KEY.includes(key) || keyLower === 'f') {
        player.actionIntent.launchMissile = true;
      }
    },

    setControlMode(mode) {
      if (CONTROLS.MODES[mode]) controlMode = mode;
    },

    getControlMode() {
      return controlMode;
    }
  };
}
//======================================
// END
//======================================
