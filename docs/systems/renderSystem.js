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

import { PLAYER } from '../config.js';
import { CANVAS } from '../config.js';


//======================================
// RENDER SYSTEM
//======================================
export function createRenderSystem({
   player,
   getPlatforms,
   getHazards,
   getCollectables,
   getExits,
   getSpawnPoints,
   getTilesets,
   getTileSize,
   getHazards,
   getCollectables,
   getTriggers,
   getEntities,
   getSpawnPoints,
   getTilesets,
   getTileSize,
   getBackground,
   getPlatformColor,
   getSonarCooldown,
   getSonarReveals,
   assets,
   darknessLayer,
   getLightSources

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
      const tilesets = getTilesets?.() ?? [];
      const bgFromGid = resolveBackgroundImageFromGid(tilesets, bg?.gid);
      const bgImageKey = normalizeBackgroundImageName(bg?.image ?? bgFromGid);
      const drawW = bg?.w ?? width;
      const drawH = bg?.h ?? height;

      if (bgImageKey && assets?.[bgImageKey]) {
         image(assets[bgImageKey], 0, 0, drawW, drawH);
      } else if (bg?.color) {
         background(bg.color);
      } else {
         background(0);
      }

   }

//======================================
// DRAW ROOM
//======================================
   let elapsedTime = 0;
   const oscillationSpeed = 2; // Hz
   const oscillationAmount = 10; // pixels

   //===TERRAIN===//
   function drawPlatforms() {
      const platforms = getPlatforms?.() ?? [];
      const platformColor = getPlatformColor?.() ?? '#5a6e82';
      const tilesets = getTilesets?.() ?? [];
      const tileSize = getTileSize?.() ?? {};
      const tileWidth = tileSize.tileWidth ?? 16;
      const tileHeight = tileSize.tileHeight ?? 16;

      noStroke();
      for (const p of platforms) {
         if (drawSpriteFromTileset(p)) continue;
         rect(p.getCornerX(), p.getCornerY(), p.getWidth(), p.getHeight());
         const tileset = getTilesetForGid(p.gid, tilesets);
         const tilesetImagePath = tilesetSourceToImagePath(tileset?.source);
         const tilesetImage = tilesetImagePath ? assets?.[`tileset:${tilesetImagePath}`] : null;

         if (tileset && tilesetImage && Number.isFinite(p.gid)) {
            const localTileId = p.gid - tileset.firstgid;
            const columns = Math.max(1, Math.floor(tilesetImage.width / tileWidth));
            const srcX = (localTileId % columns) * tileWidth;
            const srcY = Math.floor(localTileId / columns) * tileHeight;
            image(tilesetImage, p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, srcX, srcY, tileWidth, tileHeight);
            continue;
         }

         fill(platformColor);
         rect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h);
      }
   }

   function drawHazards() {
      const hazards = getHazards?.() ?? [];
      if (!hazards.length) return;

      noStroke();
      for (const h of hazards) {
         if (h.visible === false) continue;
         const style = getHazardStyle(h);
         fill(toRgba(style.color, style.alpha));

         drawRotatedAt(h.x, h.y, h.w, h.h, h.rotation, (w, hgt) => {
            if (style.shape === 'triangle') {
               triangle(-w / 2, hgt / 2, 0, -hgt / 2, w / 2, hgt / 2);
            } else {
               rect(-w / 2, -hgt / 2, w, hgt);
            }
         });
      }
   }

   function drawCollectables() {
      const collectables = getCollectables?.() ?? [];
      if (!collectables.length) return;
      const tilesets = getTilesets?.() ?? [];
      const tileSize = getTileSize?.() ?? {};
      const tileWidth = tileSize.tileWidth ?? 16;
      const tileHeight = tileSize.tileHeight ?? 16;

      noStroke();
      for (const c of collectables) {
         if (c.visible === false) continue;
         const tileset = getTilesetForGid(c.gid, tilesets);
         const tilesetImagePath = tilesetSourceToImagePath(tileset?.source);
         const tilesetImage = tilesetImagePath ? assets?.[`tileset:${tilesetImagePath}`] : null;
         const collectableType = getCollectableType(c, tileset);
         const collectableTint = getCollectableTint(collectableType);
         const drawW = tileWidth;
         const drawH = tileHeight;

         if (tileset && tilesetImage) {
            const localTileId = c.gid - tileset.firstgid;
            const columns = Math.max(1, Math.floor(tilesetImage.width / tileWidth));
            const srcX = (localTileId % columns) * tileWidth;
            const srcY = Math.floor(localTileId / columns) * tileHeight;

            drawRotatedAt(c.x, c.y, drawW, drawH, c.rotation, (w, h) => {
               if (collectableTint) tint(...collectableTint);
               image(tilesetImage, -w / 2, -h / 2, w, h, srcX, srcY, tileWidth, tileHeight);
               if (collectableTint) noTint();
            });
            continue;
         }

         const style = getCollectableStyle(c);
         const fallbackColor = collectableType === 'power'
            ? '#ffe150'
            : collectableType === 'health'
              ? '#6eff78'
              : style.color;
         fill(toRgba(fallbackColor, style.alpha));

         drawRotatedAt(c.x, c.y, drawW, drawH, c.rotation, (w, h) => {
            if (style.shape === 'diamond') {
               beginShape();
               vertex(0, -h / 2);
               vertex(w / 2, 0);
               vertex(0, h / 2);
               vertex(-w / 2, 0);
               endShape(CLOSE);
            } else {
               ellipse(0, 0, w, h);
            }
         });
      }
   }

   function drawSpawnPoints() {
      const spawnPoints = getSpawnPoints?.() ?? [];
      if (!spawnPoints.length) return;
      const tilesets = getTilesets?.() ?? [];
      const tileSize = getTileSize?.() ?? {};
      const tileWidth = tileSize.tileWidth ?? 16;
      const tileHeight = tileSize.tileHeight ?? 16;
      const side = tileWidth;
      const triHeight = tileHeight;
      const topY = -triHeight / 2;
      const baseY = triHeight / 2;

      for (const s of spawnPoints) {
         const kind = getSpawnKind(s, tilesets);
         const markerColor = kind === 'enemy' ? '#ff3b3b' : '#39ff8a';

         push();
         noStroke();
         fill(markerColor);
         triangle(
            s.x, s.y + topY,
            s.x - side / 2, s.y + baseY,
            s.x + side / 2, s.y + baseY
         );
         pop();
      }
   }

   function drawExits() {
      const exits = getExits?.() ?? [];
      if (!exits.length) return;

      strokeWeight(2);
      for (const e of exits) {
         if (e.visible === false) continue;
         const style = getExitStyle(e);
         stroke(style.color);
         fill(toRgba(style.color, Math.min(0.35, style.alpha)));
         drawRotatedAt(e.x, e.y, e.w, e.h, e.rotation, (w, h) => {
            rect(-w / 2, -h / 2, w, h);
         });
      }
      noStroke();
   }

//======================================
// DRAW SONAR REVEALS (FROM SONAR SYSTEM)
//======================================
   function drawSonarReveals() {
      if (player?.torch?.isOn) return;
      const reveals = getSonarReveals?.() ?? [];
      if (!reveals.length) return;

      rectMode(CORNER);
      for (const r of reveals) {
         const alpha = Math.max(0, Math.min(255, r.alpha ?? 0));
         noStroke();
         fill(60, 120, 180, alpha);
         rect(r.x, r.y, r.w, r.h);

         stroke(120, 200, 255, alpha);
         strokeWeight(1);
         noFill();
         rect(r.x, r.y, r.w, r.h);
      }
      rectMode(CORNER);
   }

//======================================
// DRAW PLAYER
//======================================
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
      translate(player.x, player.y);
      scale(player.facing, 1);

      fill(120);
      noStroke();
      rect(-2, -player.size * 0.4, 4, player.size * 0.6);
      rect(0.1, -player.size * 0.8, 8, 4);

      fill(150);
      noStroke();
      triangle(
         -player.size / 2, 0,
         -player.size,
         -player.size / 3,
         -player.size,
         player.size / 3
      );
      fill(255, 200, 50);
      ellipse(0, 0, player.size * 1.2, player.size * 0.8);

      fill(100, 220, 255);
      circle(player.size * 0.2, 0, player.size * 0.4);
      pop();
   }

//======================================
// DRAW UI
//======================================
   function drawUI() {
      fill(255);
      noStroke();
      text(`Power: ${Math.round(player.power.current)}`, 20, 30);

      const sonarCooldown = getSonarCooldown?.() ?? 0;
      if (Number.isFinite(sonarCooldown) && sonarCooldown > 0) {
         fill('#d61b1b');
         text(`Sonar: cooling`, 20, 55);
      } else {
         fill('#64ff64');
         text(`Sonar: ready (K)`, 20, 55);
      }
   }

//======================================
// DRAW LIGHTING
//======================================
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
         gradient.addColorStop(0, `rgba(255,255,255,${intensity})`);
         gradient.addColorStop(0.3, `rgba(255,255,255,${intensity * 0.6})`);
         gradient.addColorStop(0.6, `rgba(255,255,255,${intensity * 0.2})`);
         gradient.addColorStop(1, 'rgba(0,0,0,0)');

         ctx.fillStyle = gradient;
         ctx.beginPath();
         ctx.arc(x, y, scaledRadius, 0, Math.PI * 2);
         ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      image(darknessLayer, 0, 0);
   }

   //===UI===//
   function drawUI() {
      fill(255);
      noStroke();
      text(`Power: ${Math.round(player.power.current)}`, 20, 30);
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
// DRAW() - EVERYTHING
//======================================
   return {
      draw(deltaTime) {
         elapsedTime += deltaTime ?? 0;
         const lightSources = getLightSources?.() ?? [];

         drawBackground();
         drawPlatforms();
         drawHazards();
         drawCollectables();
         drawExits();
         drawSpawnPoints();
         drawPlayer();
         if (enableLighting) {
            drawLighting(lightSources);
         }
         drawSonarReveals();
         drawUI();
         debugHitbox(DEBUG_COLOR.DRAW);
      }
   };
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
            drawHazards();
            drawCollectables();
            drawTriggers();
            drawEntities();
            drawSpawnPoints();
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