/*
========================================
MAIN (SKETCH CANVAS)
========================================
VERSION: 2.5
SYSTEM: Main / p5.js Canvas
AUTHOR: Georgia Sweeny
========================================
*/

//======================================
// MAIN
//======================================

import { Engine } from './gameEngine/engine.js';
import { createInputSystem } from './systems/inputSystem.js';
import { createPlayerSystem } from './systems/playerSystem.js';
import { createPhysicsSystem } from './systems/physicsSystem.js';
import { createTorchSystem } from './systems/torchSystem.js';
import { createRenderSystem } from './systems/renderSystem.js';
import { createLightingSystem } from './systems/lightingSystem.js';
import { createRoomSystem } from './systems/roomSystem.js';
import { CANVAS, PLAYER, TORCH } from './config.js';
import { Player } from './entities/player.js';
import { createResourceManagementSystem } from './systems/resourceManagementSystem.js';

let engine;
let darknessLayer;
let player;

let inputSystem;
let playerSystem;
let physicsSystem;
let torchSystem;
let renderSystem;
let lightingSystem;
let roomSystem;
let resourceManagementSystem;

let assets = {};
const ROOM_FILES = ['roomA', 'roomB'];
const roomData = {};
const FIT_CANVAS_TO_ROOM = true;
const BACKGROUND_TILESET_PATH = 'assets/backgrounds/backgrounds.tsx';

function parseBackgroundTileset(tsxText) {
  const byLocalId = {};
  const byStem = {};
  const tileRegex = /<tile\s+id="(\d+)"[\s\S]*?<image\s+source="([^"]+)"/g;
  let match = tileRegex.exec(tsxText);

  while (match) {
    const localId = Number(match[1]);
    const source = match[2].split('/').pop();
    if (source) {
      byLocalId[localId] = source;
      const stem = source.replace(/\.[^/.]+$/, '');
      byStem[stem.toLowerCase()] = source;
    }
    match = tileRegex.exec(tsxText);
  }

  return { byLocalId, byStem };
}

function getTilesetForGid(room, gid) {
  if (!Number.isFinite(gid)) return null;
  let best = null;
  for (const ts of room?.tilesets ?? []) {
    const firstgid = Number(ts?.firstgid ?? 0);
    if (!firstgid || gid < firstgid) continue;
    if (!best || firstgid > best.firstgid) best = { ...ts, firstgid };
  }
  return best;
}

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

function getDirname(path) {
  const idx = String(path).lastIndexOf('/');
  return idx === -1 ? '' : String(path).slice(0, idx);
}

function parseTsxImageSource(tsxText) {
  const match = String(tsxText).match(/<image[^>]*source="([^"]+)"/i);
  return match ? match[1] : null;
}

function resolveTilesetImagePath(tilesetSource) {
  if (!tilesetSource) return null;
  const sourcePath = normalizeRelativePath('data/rooms', tilesetSource);
  if (!sourcePath.toLowerCase().endsWith('.tsx')) return sourcePath;

  const tsxText = loadStrings(sourcePath).join('\n');
  const imageSource = parseTsxImageSource(tsxText);
  if (!imageSource) return sourcePath.replace(/\.tsx$/i, '.png');

  return normalizeRelativePath(getDirname(sourcePath), imageSource);
}

function normalizeBackgroundName(name, backgroundLookup) {
  if (!name) return null;
  const fileName = String(name).split('/').pop().trim();
  if (!fileName) return null;
  if (fileName.includes('.')) return fileName;
  return backgroundLookup.byStem[fileName.toLowerCase()] ?? fileName;
}

function getMapProperty(mapData, key, fallback = null) {
  const props = mapData?.properties;
  if (!Array.isArray(props)) return fallback;
  const found = props.find((p) => p?.name === key);
  return found ? found.value : fallback;
}

function resolveBackgroundImageName(room, backgroundLookup) {
  if (room?.background?.image) {
    return normalizeBackgroundName(room.background.image, backgroundLookup);
  }

  const propImage = getMapProperty(room, 'backgroundImage', null);
  if (propImage) {
    return normalizeBackgroundName(propImage, backgroundLookup);
  }

  const backgroundLayer = (room?.layers ?? []).find((l) => (l?.name ?? '').toLowerCase() === 'background');
  const bgObject = (backgroundLayer?.objects ?? [])[0];
  const bgName = bgObject?.name ? String(bgObject.name).trim() : '';
  if (bgName) {
    return normalizeBackgroundName(bgName, backgroundLookup);
  }

  const bgGid = Number(bgObject?.gid);
  if (Number.isFinite(bgGid)) {
    const tileset = getTilesetForGid(room, bgGid);
    if (tileset && String(tileset.source ?? '').toLowerCase().endsWith('backgrounds.tsx')) {
      const localId = bgGid - tileset.firstgid;
      const fromTileset = backgroundLookup.byLocalId[localId];
      if (fromTileset) return fromTileset;
    }
  }

  const imageLayer = (room?.layers ?? []).find((l) => l?.type === 'imagelayer' && l?.image);
  if (imageLayer?.image) {
    return normalizeBackgroundName(imageLayer.image, backgroundLookup);
  }

  return null;
}

function setRoomBackgroundImageProperty(room, imageName) {
  if (!imageName) return;
  if (!Array.isArray(room.properties)) room.properties = [];
  const existing = room.properties.find((p) => p?.name === 'backgroundImage');
  if (existing) {
    existing.value = imageName;
  } else {
    room.properties.push({ name: 'backgroundImage', type: 'string', value: imageName });
  }
}

function getRoomPixelSize(roomKey) {
  const room = roomData?.[roomKey];
  if (!room) return { width: CANVAS.WIDTH, height: CANVAS.HEIGHT };

  const tileWidth = room.tilewidth ?? CANVAS.TILE_SIZE;
  const tileHeight = room.tileheight ?? CANVAS.TILE_SIZE;
  return {
    width: (room.width ?? 0) * tileWidth,
    height: (room.height ?? 0) * tileHeight
  };
}

function syncCanvasToCurrentRoom() {
  if (!FIT_CANVAS_TO_ROOM || !roomSystem) return;

  const roomKey = roomSystem.getCurrentRoom?.();
  if (!roomKey) return;

  const roomSize = getRoomPixelSize(roomKey);
  if (roomSize.width <= 0 || roomSize.height <= 0) return;
  if (width === roomSize.width && height === roomSize.height) return;

  resizeCanvas(roomSize.width, roomSize.height);
  darknessLayer.resizeCanvas(roomSize.width, roomSize.height);
}

function preload() {
  const backgroundTilesetText = loadStrings(BACKGROUND_TILESET_PATH).join('\n');
  const backgroundLookup = parseBackgroundTileset(backgroundTilesetText);

  for (const roomKey of ROOM_FILES) {
    roomData[roomKey] = loadJSON(`data/rooms/${roomKey}.json`);
  }

  const imageNames = new Set();
  const tilesetImagePaths = new Map();
  for (const room of Object.values(roomData)) {
    const imageName = resolveBackgroundImageName(room, backgroundLookup);
    setRoomBackgroundImageProperty(room, imageName);
    if (imageName) imageNames.add(imageName);

    for (const tileset of room?.tilesets ?? []) {
      if (String(tileset?.source ?? '').toLowerCase().endsWith('backgrounds.tsx')) continue;
      const tilesetImagePath = resolveTilesetImagePath(tileset?.source);
      if (tilesetImagePath) tilesetImagePaths.set(String(tileset.source), tilesetImagePath);
    }
  }

  for (const imageName of imageNames) {
    const imagePath = `assets/backgrounds/${imageName}`;
    assets[imageName] = loadImage(imagePath);
  }

  for (const [tilesetSource, imagePath] of tilesetImagePaths.entries()) {
    const img = loadImage(imagePath);
    assets[`tileset:${imagePath}`] = img;
    assets[`tilesetSource:${tilesetSource}`] = img;
    assets[`tilesetSource:${normalizeRelativePath('data/rooms', tilesetSource)}`] = img;
  }
}

function setup() {
  createCanvas(CANVAS.WIDTH, CANVAS.HEIGHT);
 // rectMode(CENTER);
  textSize(20);
  textAlign(LEFT);

  darknessLayer = createGraphics(CANVAS.WIDTH, CANVAS.HEIGHT);

  player = new Player(PLAYER.START_X, PLAYER.START_Y, PLAYER.WIDTH, PLAYER.HEIGHT);

  const initialRoom = ROOM_FILES[0];
  roomSystem = createRoomSystem({
    initialRoom,
    roomData
  });
  roomSystem.goToRoom(initialRoom, { spawnId: 'default' });
  syncCanvasToCurrentRoom();
  const playerStart = roomSystem.getPlayerStart();
  if (playerStart) {
    player.setCurrentPosition(playerStart.x, playerStart.y);
  }

  inputSystem = createInputSystem(player);
  playerSystem = createPlayerSystem(player);
  physicsSystem = createPhysicsSystem(player, () => roomSystem.getPlatforms());
  torchSystem = createTorchSystem(player.torch, player, {
    drainRate: TORCH.DRAIN_RATE
  });

  lightingSystem = createLightingSystem(player, []);

  resourceManagementSystem = createResourceManagementSystem(player, roomSystem);

  //handlers for different item types
  resourceManagementSystem.registerHandler('power', (player, item) => {
    player.power.current = Math.max(
      0,
      Math.min(player.power.current + item.amount, player.power.maxPower)
    );
  });

  renderSystem = createRenderSystem({
    player,
    getPlatforms: () => roomSystem.getPlatforms(),
    getHazards: () => roomSystem.getHazards(),
    getCollectables: () => roomSystem.getCollectables(),
    getTriggers: () => roomSystem.getTriggers(),
    getEntities: () => roomSystem.getEntities(),
    getSpawnPoints: () => roomSystem.getSpawnPoints(),
    getTilesets: () => roomSystem.getTilesets(),
    getTileSize: () => roomSystem.getTileSize(),
    getBackground: () => roomSystem.getBackground(),
    getPlatformColor: () => roomSystem.getPlatformColor(),
    assets,
    darknessLayer,
    getLightSources: () => lightingSystem.getLightSources()
  });

  engine = new Engine();
  engine.register(inputSystem);
  engine.register(playerSystem);
  engine.register(physicsSystem);
  engine.register(torchSystem);
  engine.register(roomSystem);
  engine.register(renderSystem);
  engine.register(resourceManagementSystem);
}

function draw() {
  syncCanvasToCurrentRoom();
  engine.update(deltaTime);
}

function keyPressed() {
  inputSystem.onKeyPressed?.(key, keyCode);
}

function keyReleased() {
  if (key === 'A' || key === 'a') player.intent.left = false;
  if (key === 'D' || key === 'd') player.intent.right = false;
}


window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.keyReleased = keyReleased;
