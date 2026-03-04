/*
========================================
VERSION: 2.4
ENTITY: PLAYER
AUTHOR: Georgia Sweeny
DESCRIPTION:
- Player entity class: stores player state, movement moveIntent, and components
- Manages internal resources like torch and power

RULES:
- Player class does not handle physics or collision resolution
- Player class does not render itself; rendering is handled by renderSystem
- Player class does not directly manipulate other systems
========================================
DESIGN GOALS:
- Keep player logic separate from physics and rendering
- Treat input as moveIntent (left/right/toggleTorch), not direct movement
- Encapsulate components like Torch and PowerSystem cleanly
========================================
RESPONSIBILITIES:
- Maintain player positional and state data (x, y, w, h, vy, onGround)
- Maintain runtime resources (power, torch, health, oxygen)
- Store and expose player moveIntent for systems to consume

DEPENDENCIES:
- config object: defines START_X, START_Y, WIDTH, HEIGHT, TORCH settings
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
import { PowerSystem } from '../systems/powerSystem.js';
import { Torch } from './components/torch.js';  // torch class in same folder
import { TORCH } from '../config.js';
import { Hitbox } from '../systems/hitboxSystem.js';

export class Player extends Hitbox{
   constructor(x, y, w, h){
      super(x, y, w, h);
      this.nextPos = createVector(this.position.x, this.position.y);
      this.velocity = createVector(0, 0);

      // Runtime state
      this.onGround = false;

      // Components
      this.torch = new Torch(TORCH);
      this.power = new PowerSystem();
      this.health = null;
      this.oxygen = null;

      // Unified Intent State
      this.intent = {
         up: false,
         down: false,
         left: false,
         right: false,
         toggleTorch: false,
         //sonar
         //missile
      };
   
   }
   get x(){
      return this.position.x;
   }
   set x(value){
      this.position.x = value;
   }
   get y(){
      return this.position.y;
   }
   set y(value){
      this.position.y = value;
   }
   setCurrentPosition(x, y){
      this.position.x = x;
      this.position.y = y;
      if (this.nextPos) {
         this.nextPos.x = x;
         this.nextPos.y = y;
      }
   }
   setNextPosition(){
      if(this.intent.right){this.nextPos.x += this.velocity.x}
      if(this.intent.left){this.nextPos.x -= this.velocity.x}
      if(this.intent.up){this.nextPos.y -= this.velocity.y}
      if(this.intent.down){this.nextPos.y += this.velocity.y}
      this.resetIntent();
  }
   movePlayer(){
      this.position.x = this.nextPos.x;
      this.position.y = this.nextPos.y;
   }
   setVelocityX(x=0){
      this.velocity.x = x;
   }
   setVelocityY(y=0){
      this.velocity.y = y;
   }
   getIntent(){
      return this.intent;
   }
   switchTorch(){
      this.intent.toggleTorch = true;
   }
   requestAction(actionKey){
      if (!this.actionIntent || !(actionKey in this.actionIntent)) return;
      this.actionIntent[actionKey] = true;
   }
   consumeAction(actionKey){
      if (!this.actionIntent || !(actionKey in this.actionIntent)) return false;
      const requested = this.actionIntent[actionKey] === true;
      this.actionIntent[actionKey] = false;
      return requested;
   }
   getLightSources(){
      const powerPercent = this.power?.getPercent?.() ?? 0;
      const torchIntensity = this.torch?.getIntensity?.(powerPercent) ?? 0;
      const sources = [];

      if (torchIntensity > 0) {
         sources.push({
            x: this.x,
            y: this.y,
            radius: this.torch.radius,
            intensity: torchIntensity
         });
      }

      if (LIGHTING?.PLAYER_AMBIENT?.radius && LIGHTING?.PLAYER_AMBIENT?.brightness) {
         sources.push({
            x: this.x,
            y: this.y,
            radius: LIGHTING.PLAYER_AMBIENT.radius,
            intensity: LIGHTING.PLAYER_AMBIENT.brightness
         });
      }

      return sources;
   }
   resetMoveIntent(){
      for(let i in this.moveIntent){
         this.moveIntent[i] = false;
      }
   }
};

//======================================
// END
//======================================
