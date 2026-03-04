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
- Treat input as moveIntent (left/right/jump/toggleTorch), not direct movement
- Encapsulate components like Torch and PowerSystem cleanly
========================================
RESPONSIBILITIES:
- Maintain player positional and state data (x, y, w, h, vy, onGround)
- Maintain runtime resources (power, torch, health, oxygen)
- Store and expose player moveIntent for systems to consume

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
         jump: false,
         toggleTorch: false,
         emitSonar: false
      };
      
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
   resetIntent(){
      this.intent.up = false;
      this.intent.down = false;
      this.intent.left = false;
      this.intent.right = false;
   }
   emitSonar(){
      this.intent.emitSonar = true;
   }
   // add getter functions for player specific variables
};

//======================================
// END
//======================================
