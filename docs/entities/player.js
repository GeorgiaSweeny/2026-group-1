/*
========================================
VERSION: 2.4
ENTITY: PLAYER
AUTHOR: Georgia Sweeny
DESCRIPTION:
- Player entity class: stores player state, movement intent, and components
- Manages internal resources like torch and power

RULES:
- Player class does not handle physics or collision resolution
- Player class does not render itself; rendering is handled by renderSystem
- Player class does not directly manipulate other systems
========================================
DESIGN GOALS:
- Keep player logic separate from physics and rendering
- Treat input as intent (left/right/jump/toggleTorch), not direct movement
- Encapsulate components like Torch and PowerSystem cleanly
========================================
RESPONSIBILITIES:
- Maintain player positional and state data (x, y, w, h, vy, onGround)
- Maintain runtime resources (power, torch, health, oxygen)
- Store and expose player intent for systems to consume

DEPENDENCIES:
- config object: defines START_X, START_Y, WIDTH, HEIGHT, JUMP_POWER, TORCH settings
- PowerSystem for tracking energy usage (e.g., torch drain)
- Torch class for player-held light source

USAGE:
import { Player } from './entities/player.js';
const player = new Player(PLAYER_CONFIG);
engine.register(playerSystem); // playerSystem consumes this class
========================================
*/


//======================
// PLAYER CLASS
//======================
import { TORCH } from '../config.js';
import { LIGHTING } from '../config.js';
import { Torch } from './components/torch.js';  // torch class in same folder
import { PowerSystem } from '../systems/powerSystem.js';

export class Player {
   constructor(config) {
      // Config-driven defaults
      this.x = config.START_X;
      this.y = config.START_Y;
      this.w = config.WIDTH;
      this.h = config.HEIGHT;
      this.size = config.SIZE;
      this.facing = 1; // 1 for right, -1 for left


      // Physics state: Velocity 
      this.vx = 0; // Velocity for physics system
      this.vy = 0; // Vertical velocity, not used in submarine mode but kept for potential future use


      this.intent = {
         left: false,
         right: false,
         up: false,
         down: false,
         toggleTorch: false,
      };

      // components
      this.torch = new Torch(config.TORCH ?? TORCH);

      // Runtime resources
      this.power = new PowerSystem();
      this.health = null;

      // Ambient light values (owned by player)
      this.ambientRadius = LIGHTING.PLAYER_AMBIENT.radius;
      this.ambientBrightness = LIGHTING.PLAYER_AMBIENT.brightness;
   }

      getLightSources() {
         const lights = [];

         // Ambient (constant)
         lights.push({
            x: this.x,
            y: this.y,
            radius: this.ambientRadius,
            intensity: this.ambientBrightness
         });

         // Torch
         if (this.torch.isOn) {
            const intensity = this.torch.getIntensity(this.power.getPercent());

            if (intensity > 0) {
               lights.push({
                  x: this.x,
                  y: this.y,
                  radius: this.torch.radius,
                  intensity
               });
            }
         }

         return lights;
      }
   }
//======================================
// END
//======================================
