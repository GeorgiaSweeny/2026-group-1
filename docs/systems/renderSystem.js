/*
========================================
VERSION: 2.6
SYSTEM: RENDER SYSTEM
AUTHOR: Georgia Sweeny
DESCRIPTION:
- Draws room background, platforms, player, UI.
  and ligthing

- Power modifiers added by Monal
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
   getSonarCooldown,
   getResources

}) {
   let elapsedTime = 0;
   const oscillationSpeed = 2; // Hz
   const oscillationAmount = 10; // pixels

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

   function drawPlayer() {
      stroke(150, 0, 25);
      fill(225, 0, 50);
      rect(player.getCornerX(), player.getCornerY(), player.getWidth(), player.getHeight());
   }

   function drawUI() {
      fill(255);
      noStroke();
      textAlign(LEFT);
      textSize(20);
      text(`Power: ${Math.round(player.power.current)}`, 20, 30);
      
      const cooldownPercent = getSonarCooldown?.() ?? 0;
      if (cooldownPercent > 0) {
         fill('#d61b1bff');
         text(`Sonar: Cooling Down`, 20, 60);
      } else {
         fill('#64ff64ff');
         text(`Press K to Sonar: Ready`, 20, 60);
      }
   }

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
   
   function drawPlatforms(isIlluminated = false) {
      const platforms = getPlatforms?.() ?? [];
      const platformColor = getPlatformColor?.() ?? '#5a6e82';
      noStroke();

      if (!isIlluminated) {
         fill(platformColor);
      }

      for (const p of platforms) {
         if (isIlluminated && (!p.illumination || p.illumination <= 0)) {
            continue;
         }

         const px = typeof p.getCornerX === 'function' ? p.getCornerX() : p.x;
         const py = typeof p.getCornerY === 'function' ? p.getCornerY() : p.y;
         const pw = typeof p.getWidth === 'function' ? p.getWidth() : p.w;
         const ph = typeof p.getHeight === 'function' ? p.getHeight() : p.h;

         if (isIlluminated) {
            const c = color(platformColor);
            const illuminateColor = color('#5a6e82');
            const mixedColor = lerpColor(c, illuminateColor, p.illumination / 255);
            mixedColor.setAlpha(p.illumination); 
            fill(mixedColor);
         }

         rect(px, py, pw, ph);
      }
   }

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

   return {
      draw() {
         const lightSources = getLightSources?.() ?? [];

         drawBackground();
         drawPlatforms(false); // Draw base platforms in darkness
         drawPlayer();
         drawLighting(lightSources);
         drawPlatforms(true);  // Draw platforms over darkness
         drawUI();
         debugHitbox(DEBUG_COLOR.DRAW);
      }
   }
}
//======================================
// END
//======================================
