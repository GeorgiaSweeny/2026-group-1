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
   getHazards,
   getCollectables,
   getTriggers,
   getEntities,
   getSpawnPoints,
   getTilesets,
   getTileSize,
   getBackground,
   getPlatformColor,
   assets,
   darknessLayer,
   getLightSources,
   getActivePulses,
   getRevealedWalls,
   getCameraOffset,
   getCameraScale,

}) {
   let elapsedTime = 0;
   const oscillationSpeed = 2; // Hz
   const oscillationAmount = 10; // pixels

//======================================
// DRAW GAME
//======================================
   function normalizeRelativePath(basePath, relativePath) {
      const baseParts = String(basePath).split('/').filter(Boolean);
      const relParts = String(relativePath ?? '').split('/').filter(Boolean);
      for (const part of relParts) {
         if (part === '.') continue;
         if (part === '..') {
            baseParts.pop();
            continue;
         }
         baseParts.push(part);
      }
      return baseParts.join('/');
   }

   function tilesetSourceToImagePath(source) {
      if (!source) return null;
      return normalizeRelativePath('data/rooms', source).replace(/\.tsx$/i, '.png');
   }

   function getTilesetForGid(gid, tilesets = []) {
      if (!Number.isFinite(gid) || gid <= 0 || !Array.isArray(tilesets) || !tilesets.length) return null;
      let best = null;
      for (const tileset of tilesets) {
         const firstgid = Number(tileset?.firstgid ?? 0);
         if (!firstgid || gid < firstgid) continue;
         if (!best || firstgid > best.firstgid) {
            best = { ...tileset, firstgid };
         }
      }
      return best;
   }

   function getObjectRect(obj) {
      if (!obj) return null;
      if (typeof obj.getCornerX === 'function' && typeof obj.getCornerY === 'function') {
         return {
            x: obj.getCornerX(),
            y: obj.getCornerY(),
            w: obj.getWidth(),
            h: obj.getHeight()
         };
      }
      const tileSize = getTileSize?.() ?? {};
      const fallbackW = tileSize.tileWidth ?? 16;
      const fallbackH = tileSize.tileHeight ?? 16;
      const w = obj.w ?? obj.width ?? fallbackW;
      const h = obj.h ?? obj.height ?? fallbackH;
      const cx = obj.x ?? 0;
      const cy = obj.y ?? 0;
      return { x: cx - (w / 2), y: cy - (h / 2), w, h };
   }

   function drawSpriteFromTileset(obj) {
      const gid = Number(obj?.gid);
      if (!Number.isFinite(gid)) return false;

      const tilesets = getTilesets?.() ?? [];
      const tileset = getTilesetForGid(gid, tilesets);
      if (!tileset) return false;

      if (String(tileset.source ?? '').toLowerCase().endsWith('backgrounds.tsx')) {
         return false;
      }

      const imagePath = tilesetSourceToImagePath(tileset.source);
      const tilesetImage = imagePath ? assets?.[`tileset:${imagePath}`] : null;
      if (!tilesetImage) return false;

      const rect = getObjectRect(obj);
      if (!rect) return false;

      const tileSize = getTileSize?.() ?? {};
      const tileWidth = tileSize.tileWidth ?? tileset.tilewidth ?? 16;
      const tileHeight = tileSize.tileHeight ?? tileset.tileheight ?? 16;
      const localTileId = gid - Number(tileset.firstgid);
      const columns = Number(tileset.columns) || Math.max(1, Math.floor(tilesetImage.width / tileWidth));
      const srcX = (localTileId % columns) * tileWidth;
      const srcY = Math.floor(localTileId / columns) * tileHeight;

      image(tilesetImage, rect.x, rect.y, rect.w, rect.h, srcX, srcY, tileWidth, tileHeight);
      return true;
   }

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
      const platformColor = getPlatformColor?.() ?? '#5a6e82ff';

      noStroke();
      fill(platformColor);
      
      for (const p of platforms) {
         if (drawSpriteFromTileset(p)) continue;
         rect(p.getCornerX(), p.getCornerY(), p.getWidth(), p.getHeight());
      }
   }

   //=== HAZARDS ===//
   function drawHazards() {
      const hazards = getHazards?.() ?? [];
      if (!hazards.length) return;

      noStroke();
      fill(220, 70, 70, 180);
      rectMode(CENTER);
      for (const hazard of hazards) {
         if (hazard.visible === false) continue;
         if (drawSpriteFromTileset(hazard)) continue;
         rect(hazard.x, hazard.y, hazard.w, hazard.h);
      }
      rectMode(CORNER);
   }

   //=== COLLECTABLES ===//
   function drawCollectables() {
      const collectables = getCollectables?.() ?? [];
      if (!collectables.length) return;

      noStroke();
      fill(255, 225, 80, 220);
      for (const item of collectables) {
         if (item.visible === false) continue;
         if (drawSpriteFromTileset(item)) continue;
         ellipse(item.x, item.y, Math.max(8, item.w), Math.max(8, item.h));
      }
   }

   //=== TRIGGERS ===//
   function drawTriggers() {
      const triggers = getTriggers?.() ?? [];
      if (!triggers.length) return;

      noFill();
      stroke(140, 180, 255, 180);
      strokeWeight(1);
      rectMode(CENTER);
      for (const trigger of triggers) {
         if (trigger.visible === false) continue;
         if (drawSpriteFromTileset(trigger)) continue;
         rect(trigger.x, trigger.y, trigger.w, trigger.h);
      }
      rectMode(CORNER);
      noStroke();
   }

   //=== ENTITIES ===//
   function drawEntities() {
      const entities = getEntities?.() ?? [];
      if (!entities.length) return;

      noStroke();
      fill(180, 110, 230, 210);
      for (const entity of entities) {
         if (entity.visible === false) continue;
         if (entity.properties?.spawnId != null) continue;
         if (drawSpriteFromTileset(entity)) continue;
         rect(entity.x - (entity.w / 2), entity.y - (entity.h / 2), entity.w, entity.h);
      }
   }

   //=== SPAWNS ===//
   function drawSpawnPoints() {
      const spawnPoints = getSpawnPoints?.() ?? [];
      if (!spawnPoints.length) return;

      for (const spawn of spawnPoints) {
         if (drawSpriteFromTileset(spawn)) continue;
         const isPlayerSpawn = String(spawn.spawnId ?? '').toLowerCase() === 'default';
         noStroke();
         fill(isPlayerSpawn ? color(80, 255, 130, 220) : color(255, 130, 80, 220));
         triangle(
            spawn.x, spawn.y - 8,
            spawn.x - 7, spawn.y + 6,
            spawn.x + 7, spawn.y + 6
         );
      }
   }

   //===PLAYER===//
   function drawPlayer() {
      push();
      translate(player.position.x, player.position.y);
      scale(player.facing, 1);

      // Periscope
      fill(120);
      noStroke();
      rect(-2, -player.w * 0.9, 4, player.w * 0.6);
      rect(-2, -player.w * 0.9, 8, 4);

      // Tail fin
      fill(150);
      triangle(
         -player.w / 2, 0,
         -player.w, -player.w / 3,
         -player.w, player.w / 3
      );

      // Body
      fill(255, 200, 50);
      ellipse(0, 0, player.w * 1.2, player.w * 0.8);

      // Porthole window
      fill(100, 220, 255);
      circle(player.w * 0.2, 0, player.w * 0.4);

      pop();
   }

   //===BUBBLES===//
   function drawBubbles() {
      const bubbleList = player.bubbles ?? [];
      noStroke();
      for (const b of bubbleList) {
         if (b.life > 0) {
            fill(150, 220, 255, b.life);
            circle(b.x, b.y, b.size);
         }
      }
   }

   //===SONAR PULSES===//
   function drawSonarPulses() {
      const activePulses = getActivePulses?.() ?? [];
      if (!activePulses.length) return;

      push();
      blendMode(ADD);
      for (const pulse of activePulses) {
         if (typeof pulse.show === 'function') {
            pulse.show();
         }
      }
      pop();
   }

   //===SONAR WALLS===//
   function drawSonarWalls() {
      const walls = getRevealedWalls?.() ?? [];
      for (const wall of walls) {
         if (wall.alpha > 1) {
            noStroke();
            fill(90, 110, 130, wall.alpha);
            rect(wall.x, wall.y, wall.w, wall.h, 3);
         }
      }
   }

   //===LIGHTING===//
   function drawLighting(lightSources = [], cam = { x: 0, y: 0 }, camScale = 1) {
      darknessLayer.clear();
      darknessLayer.background(0);

      const ctx = darknessLayer.drawingContext;
      ctx.globalCompositeOperation = 'destination-out';

      for (const light of lightSources) {
         const { x, y, radius, intensity = 1 } = light;
         const screenX = (x - cam.x) * camScale;
         const screenY = (y - cam.y) * camScale;
         const scaledRadius = radius * (0.8 + 0.2 * intensity) * camScale;
         const gradient = ctx.createRadialGradient(
            screenX, screenY, scaledRadius * 0.1,
            screenX, screenY, scaledRadius
         );
         gradient.addColorStop(0, 'rgba(255,255,255,1)');
         gradient.addColorStop(1, 'rgba(0,0,0,0)');

         ctx.fillStyle = gradient;
         ctx.beginPath();
         ctx.arc(screenX, screenY, scaledRadius, 0, Math.PI * 2);
         ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      image(darknessLayer, 0, 0);
   }

   //===UI===//
   function drawUI() {
      push();
      blendMode(BLEND);

      const barX = 10;
      const barY = 10;
      const barW = 120;
      const barH = 14;
      const pct = constrain(player.power.getPercent(), 0, 1);

      // Background
      noStroke();
      fill(40, 40, 40, 200);
      rect(barX, barY, barW, barH, 3);

      // Fill — green to red
      const r = lerp(220, 50, pct);
      const g = lerp(60, 200, pct);
      fill(r, g, 60);
      rect(barX, barY, barW * pct, barH, 3);

      // Border
      noFill();
      stroke(200);
      strokeWeight(1);
      rect(barX, barY, barW, barH, 3);

      // Label
      noStroke();
      fill(255);
      textSize(10);
      textAlign(LEFT, TOP);
      text(`Power: ${Math.round(player.power.current)}`, barX + 4, barY + 2);

      pop();
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
            const cam = getCameraOffset?.() ?? { x: 0, y: 0 };
            const camScale = getCameraScale?.() ?? 1;

            // --- Screen space: background fills viewport ---
            drawBackground();

            // --- World space (scaled + translated by camera) ---
            push();
            scale(camScale);
            translate(-cam.x, -cam.y);

            drawPlatforms();
            drawHazards();
            drawCollectables();
            drawTriggers();
            drawEntities();
            drawSpawnPoints();
            drawSonarWalls();
            drawSonarPulses();
            drawBubbles();
            drawPlayer();
            debugHitbox(DEBUG_COLOR.DRAW);

            pop();

            // --- Screen space (fixed to viewport) ---
            drawLighting(lightSources, cam, camScale);
            drawUI();
         }
      };
   }
//======================================
// END
//======================================