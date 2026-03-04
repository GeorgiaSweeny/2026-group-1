/*
========================================
VERSION: 3.0
SYSTEM: RENDER SYSTEM
AUTHOR: Georgia Sweeny
DESCRIPTION:
- Draws room background, platforms, player, UI.
  and ligthing

- Power modifiers added by Monal
- Hitbox debug by Nick
========================================
*/

import { DEBUG_COLOR } from "../config.js";

//======================================
// RENDER SYSTEM
//======================================
export function createRenderSystem({
   player,
   getPlatforms,
   getBackground,
   getPlatformColor,
   assets,
   darknessLayer,
   getLightSources,
   getResources

}) {
   let elapsedTime = 0;
   const oscillationSpeed = 2; // Hz
   const oscillationAmount = 10; // pixels

//======================================
// ROOM - HELPERS
//======================================

//===BACKGROUND===//
   function drawBackground() {
      const bg = getBackground?.();

      if (bg?.color) {
         background(bg.color);
      } else {
         background(0);
      }

      if (bg?.image && assets?.[bg.image]) {
         image(assets[bg.image], 0, 0, width, height);
      }
   }

   //===TERRAIN===//
   function drawPlatforms() {
      const platforms = getPlatforms?.() ?? [];
      const platformColor = getPlatformColor?.() ?? '#5a6e82';

      noStroke();
      fill(platformColor);
      
      for (const p of platforms) {
         rect(p.getCornerX(), p.getCornerY(), p.getWidth(), p.getHeight());
      }
   }

   //===PLAYER===//
   function drawPlayer() {
      stroke(150, 0, 25);
      fill(225, 0, 50);
      rect(player.getCornerX(), player.getCornerY(), player.getWidth(), player.getHeight());
   }

   //===UI===//
   function drawUI() {
      fill(255);
      noStroke();
      text(`Power: ${Math.round(player.power.current)}`, 20, 30);
   }

   //===LIGHTING===//
   function drawLighting(lightSources = []) {
      darknessLayer.clear();
      darknessLayer.background(0);

      const ctx = darknessLayer.drawingContext;
      ctx.globalCompositeOperation = 'destination-out';

      for (const light of lightSources) {
         const { x, y, radius, intensity = 1 } = light;
         const scaledRadius = radius * (0.8 + 0.2 * intensity);
         const gradient = ctx.createRadialGradient(
            x, y, scaledRadius * 0.1,
            x, y, scaledRadius
         );
         gradient.addColorStop(0, 'rgba(255,255,255,1)');
         gradient.addColorStop(1, 'rgba(0,0,0,0)');

         ctx.fillStyle = gradient;
         ctx.beginPath();
         ctx.arc(x, y, scaledRadius, 0, Math.PI * 2);
         ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      image(darknessLayer, 0, 0);
   }
//======================================
// VISUAL DEBUG HELPERS
//======================================
//===HITBOX-DEBUG===//
   // draw by changing DRAW to true in config, shows hitbox boundaries
   function debugHitbox(drawThis){
      if(drawThis){
         let walls = getPlatforms();
         for(let i in walls){
            walls[i].debugDrawHitbox(DEBUG_COLOR.WALL);
         }
         player.debugDrawHitbox(DEBUG_COLOR.PLAYER);
      }
   }

//======================================
// DRAW EVERYTHING
//======================================
      return {
         draw(deltaTime) {
            elapsedTime += deltaTime;
            const lightSources = getLightSources?.() ?? [];

            drawBackground();
            drawPlatforms();
            drawResources(); 
            drawPlayer();
            drawLighting(lightSources);
            drawUI();
            debugHitbox(DEBUG_COLOR.DRAW);
         }
      };
   }
//======================================
// END
//======================================
