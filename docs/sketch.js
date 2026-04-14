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

import { Engine } from "./gameEngine/engine.js";
import { createInputSystem } from "./systems/inputSystem.js";
import { createPlayerSystem } from "./systems/playerSystem.js";
import { createPhysicsSystem } from "./systems/physicsSystem.js";
import { createTorchSystem } from "./systems/torchSystem.js";
import { createRenderSystem } from "./systems/renderSystem.js";
import { createLightingSystem } from "./systems/lightingSystem.js";
import { createSonarSystem } from "./systems/sonarSystem.js";
import { createRoomSystem } from "./systems/roomSystem.js";
import { createPauseMenuSystem } from "./systems/pauseMenuSystem.js";
import { createCameraSystem } from "./systems/cameraSystem.js";
import { CAMERA, CANVAS, DISPLAY, PLAYER, POWER, TORCH, TIME, GAME } from "./config.js";
import { Player } from "./entities/player.js";
import { createResourceManagementSystem } from "./systems/resourceManagementSystem.js";
import { createMenuSystem } from "./systems/menuSystem.js";
import { createShopSystem } from "./systems/shopSystem.js";
import { createMissileSystem } from "./systems/missileSystem.js";
import { createParticleSystem } from "./systems/particleSystem.js";
import { createEnemySystem } from './systems/enemySystem.js';
import { createWinScreenSystem } from "./systems/winScreenSystem.js";


let accumulator = 0;
let alpha;

let engine;
let darknessLayer;
let player;

let inputSystem;
let playerSystem;
let physicsSystem;
let torchSystem;
let sonarSystem;
let renderSystem;
let lightingSystem;
let roomSystem;
let resourceManagementSystem;
let enemySystem;
let pauseMenuSystem;
let shopSystem;
let missileSystem;
let particleSystem;
let cameraSystem;
let lastEnsuredRoom = null;
let gameState = "MENU";
let menuSystem;
let winScreenSystem;
const WIN_STATE = "WIN";

let assets = {};
const INITIAL_ROOM_ID = "roomA";
const ROOM_IDS = ["roomA", "roomB"];
const roomData = {};
const FIT_CANVAS_TO_ROOM = false;
let useDevResolution = false;
const BACKGROUND_FILE_MAP = {
  "bg-atmosphere": "bg-atmosphere.jpg",
  "bg-atmosphere.jpg": "bg-atmosphere.jpg",
};

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
  const baseParts = String(basePath).split("/").filter(Boolean);
  const relParts = String(relativePath ?? "")
    .split("/")
    .filter(Boolean);
  for (const part of relParts) {
    if (part === ".") continue;
    if (part === "..") {
      baseParts.pop();
      continue;
    }
    baseParts.push(part);
  }
  return baseParts.join("/");
}

function tilesetSourceToImagePath(source) {
  if (!source) return null;
  // backgrounds.tsx is an image collection (no single .png atlas file to load).
  if (String(source).toLowerCase().endsWith("backgrounds.tsx")) return null;
  const pngSource = source.replace(/\.tsx$/i, ".png");
  return normalizeRelativePath("mapdata/rooms", pngSource);
}

function parseTsxTileProperties(xmlText) {
  if (!xmlText || typeof DOMParser === "undefined") return {};
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const byId = {};
  const tileNodes = Array.from(doc.querySelectorAll("tile"));

  for (const tileNode of tileNodes) {
    const localId = Number(tileNode.getAttribute("id"));
    if (!Number.isFinite(localId)) continue;

    const props = {};
    const propertyNodes = Array.from(
      tileNode.querySelectorAll("properties > property"),
    );
    for (const propNode of propertyNodes) {
      const name = propNode.getAttribute("name");
      if (!name) continue;
      const valueAttr = propNode.getAttribute("value");
      props[name] = valueAttr ?? propNode.textContent ?? "";
    }
    if (Object.keys(props).length) {
      byId[localId] = props;
    }
  }

  return byId;
}

function getMapProperty(mapData, key, fallback = null) {
  const props = mapData?.properties;
  if (!Array.isArray(props)) return fallback;
  const found = props.find((p) => p?.name === key);
  return found ? found.value : fallback;
}

function normalizeBackgroundImageName(name) {
  if (!name) return null;
  const raw = String(name).trim();
  if (!raw) return null;
  if (raw.includes("/")) return raw;
  if (BACKGROUND_FILE_MAP[raw]) return BACKGROUND_FILE_MAP[raw];
  if (/\.[a-z0-9]+$/i.test(raw)) return raw;
  return raw;
}

function resolveBackgroundImageFromGid(room, gid) {
  if (!Number.isFinite(gid) || gid <= 0) return null;
  const tilesets = room?.tilesets ?? [];
  let best = null;
  for (const ts of tilesets) {
    const firstgid = Number(ts?.firstgid ?? 0);
    if (!firstgid || gid < firstgid) continue;
    if (!best || firstgid > best.firstgid) best = { ...ts, firstgid };
  }
  if (!best) return null;

  if (
    String(best.source ?? "")
      .toLowerCase()
      .endsWith("backgrounds.tsx")
  ) {
    const localId = gid - best.firstgid;
    const byId = {
      0: "bg-atmosphere.jpg",
      1: "bg-atmosphere.jpg",
    };
    return byId[localId] ?? null;
  }
  return null;
}

function getBackgroundImageName(room) {
  const roomBg = normalizeBackgroundImageName(room?.background?.image);
  if (roomBg) return roomBg;

  const propImage = getMapProperty(room, "backgroundImage", null);
  if (propImage) return propImage;

  const bgObjectLayer = (room?.layers ?? []).find(
    (l) =>
      l?.type === "objectgroup" &&
      String(l?.name ?? "")
        .toLowerCase()
        .includes("background"),
  );
  const bgObject = (bgObjectLayer?.objects ?? [])[0];
  const bgObjectProps = bgObject?.properties ?? [];
  const bgPropImage = bgObjectProps.find(
    (p) => p?.name === "backgroundImage" || p?.name === "image",
  )?.value;
  const propBg = normalizeBackgroundImageName(bgPropImage);
  if (propBg) return propBg;
  const bgGidImage = resolveBackgroundImageFromGid(room, bgObject?.gid ?? null);
  if (bgGidImage) return bgGidImage;
  const namedBg = normalizeBackgroundImageName(bgObject?.name);
  if (namedBg) return namedBg;

  const imageLayer = (room?.layers ?? []).find(
    (l) => l?.type === "imagelayer" && l?.image,
  );
  if (imageLayer?.image) return imageLayer.image;

  return null;
}

function ensureRoomAssetsLoaded(roomId) {
  const room = roomData[roomId];
  if (!room) return;

  const backgroundImageName = getBackgroundImageName(room);
  if (backgroundImageName && !assets[backgroundImageName]) {
    const backgroundPath = backgroundImageName.includes("/")
      ? backgroundImageName
      : `assets/backgrounds/${backgroundImageName}`;
    assets[backgroundImageName] = loadImage(backgroundPath);
  }

  for (const tileset of room?.tilesets ?? []) {
    const imagePath = tilesetSourceToImagePath(tileset?.source);
    if (!imagePath) continue;
    const key = `tileset:${imagePath}`;
    if (!assets[key]) {
      assets[key] = loadImage(imagePath);
    }
  }
}

function getRoomPixelSize(roomKey) {
  const room = roomData?.[roomKey];
  if (!room) return { width: CANVAS.WIDTH, height: CANVAS.HEIGHT };

  const tileWidth = room.tilewidth ?? CANVAS.TILE_SIZE;
  const tileHeight = room.tileheight ?? CANVAS.TILE_SIZE;
  return {
    width: (room.width ?? 0) * tileWidth,
    height: (room.height ?? 0) * tileHeight,
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
  applyDisplayScale();
}

function preload() {
  for (const roomId of ROOM_IDS) {
    roomData[roomId] = loadJSON(`mapdata/rooms/${roomId}.json`);
  }

  const tilePropsBySourcePath = {};
  for (const room of Object.values(roomData)) {
    for (const tileset of room?.tilesets ?? []) {
      const sourcePath = normalizeRelativePath(
        "mapdata/rooms",
        tileset?.source ?? "",
      );
      if (!sourcePath.toLowerCase().endsWith(".tsx")) continue;
      if (tilePropsBySourcePath[sourcePath]) continue;

      const tsxLines = loadStrings(sourcePath) ?? [];
      tilePropsBySourcePath[sourcePath] = parseTsxTileProperties(
        tsxLines.join("\n"),
      );
    }
  }

  for (const room of Object.values(roomData)) {
    for (const tileset of room?.tilesets ?? []) {
      const sourcePath = normalizeRelativePath(
        "mapdata/rooms",
        tileset?.source ?? "",
      );
      tileset.tilePropertiesById = tilePropsBySourcePath[sourcePath] ?? {};
    }
  }

  const imageNames = new Set();
  for (const room of Object.values(roomData)) {
    const imageName = getBackgroundImageName(room);

    if (imageName) imageNames.add(imageName);
  }

  for (const imageName of imageNames) {
    const imagePath = imageName.includes("/")
      ? imageName
      : `assets/backgrounds/${imageName}`;
    assets[imageName] = loadImage(imagePath);
  }

  for (const filename of Object.values(BACKGROUND_FILE_MAP)) {
    if (!assets[filename]) {
      assets[filename] = loadImage(`assets/backgrounds/${filename}`);
    }
  }

  const tilesetImagePaths = new Set();
  for (const room of Object.values(roomData)) {
    for (const tileset of room?.tilesets ?? []) {
      const imagePath = tilesetSourceToImagePath(tileset?.source);
      if (imagePath) tilesetImagePaths.add(imagePath);
    }
  }

  for (const imagePath of tilesetImagePaths) {
    assets[`tileset:${imagePath}`] = loadImage(imagePath);
  }
}

function setup() {
  createCanvas(CANVAS.WIDTH, CANVAS.HEIGHT);
  textSize(20);
  textAlign(LEFT);
  applyDisplayScale();

  menuSystem = createMenuSystem();
  winScreenSystem = createWinScreenSystem();

  player = new Player(PLAYER);

  const initialRoom = INITIAL_ROOM_ID;
  roomSystem = createRoomSystem({
    initialRoom,
    roomData,
    player,
    onRoomLoaded: ({ room, width: roomWidth, height: roomHeight }) => {
      if (room) {
        ensureRoomAssetsLoaded(room);
        lastEnsuredRoom = room;
      }

      if (!FIT_CANVAS_TO_ROOM) return;
      if (!roomWidth || !roomHeight) return;
      resizeCanvas(roomWidth, roomHeight);
      if (darknessLayer) {
        darknessLayer.resizeCanvas(roomWidth, roomHeight);
      }
    },
    onWin: () => {
      gameState = WIN_STATE;
    },
  });
  roomSystem.goToRoom(initialRoom, { spawnId: "default" });
  syncCanvasToCurrentRoom();
  const playerStart = roomSystem.getPlayerStart();
  if (playerStart) {
    player.setCurrentPosition(playerStart.x, playerStart.y);
  }

  darknessLayer = createGraphics(width, height);

  inputSystem = createInputSystem(player);
  playerSystem = createPlayerSystem(player);
  physicsSystem = createPhysicsSystem(player, () => roomSystem.getRoomState());
  cameraSystem = createCameraSystem(player, CANVAS.WIDTH, CANVAS.HEIGHT);
  cameraSystem.setScale(CAMERA.DEFAULT_SCALE);
  // Snap camera to player's initial position
  cameraSystem.snapTo(player.position.x, player.position.y);
  torchSystem = createTorchSystem(player.torch, player, {
    drainRate: POWER.DRAIN_RATE,
    getDifficulty: () =>
      pauseMenuSystem ? pauseMenuSystem.getDifficulty() : "normal",
  });

  sonarSystem = createSonarSystem(
    player,
    () => roomSystem.getPlatforms(),
    () => roomSystem.getHazards(),
    () => roomSystem.getCollectables(),
  );
 

  missileSystem = createMissileSystem(player);

  particleSystem = createParticleSystem(player, () => roomSystem.getCollisionData?.());

  lightingSystem = createLightingSystem(
    player,
    () => sonarSystem?.getSonarLights?.() ?? [],
  );

  resourceManagementSystem = createResourceManagementSystem(
    player,
    roomSystem,
    () => roomSystem.getCollectables(),
    () => roomSystem.getHazards(),
    () => pauseMenuSystem.getDifficulty(),
  );

  enemySystem = createEnemySystem(
    player,
    () => roomSystem.getEnemies()
  );
  
  renderSystem = createRenderSystem({
    player,
    getPlatforms: () => roomSystem.getPlatforms(),
    getHazards: () => roomSystem.getHazards(),
    getCollectables: () =>
      roomSystem
        .getCollectables()
        .filter((c) => !resourceManagementSystem.isCollected(c)),
    getEnemies: () => enemySystem.getCrabs(),
    getTriggers: () => roomSystem.getTriggers(),
    getEntities: () => roomSystem.getEntities(),
    getSpawnPoints: () => roomSystem.getSpawnPoints(),
    getTilesets: () => roomSystem.getTilesets(),
    getTileSize: () => roomSystem.getTileSize(),
    getBackground: () => roomSystem.getBackground(),
    getPlatformColor: () => roomSystem.getPlatformColor(),
    getSonarCooldown: () => sonarSystem?.getCooldownPercent?.(),
    getSonarReveals: () => sonarSystem?.getRevealedWalls?.(),
    getSonarHazardReveals: () => sonarSystem?.getRevealedHazards?.(),
    getSonarCollectableReveals: () => sonarSystem?.getRevealedCollectables?.(),
    assets,
    darknessLayer,
    getLightSources: () => lightingSystem.getLightSources(),
    getActivePulses: () => sonarSystem?.getActivePulses?.() ?? [],
    getRevealedWalls: () => sonarSystem?.getRevealedWalls?.() ?? [],
    getCameraOffset: () => cameraSystem.getOffset(),
    getOldCamPosition: () => cameraSystem.getOldCamPosition(),
    getCameraScale: () => cameraSystem.getScale(),
    getMissiles: () => missileSystem.getMissiles(),
    getParticles: () => particleSystem.getParticles(),
  });

  pauseMenuSystem = createPauseMenuSystem({
    onDifficultyChange: (diff) => {},
    onResolutionChange: (isDev) => {
      useDevResolution = isDev;
      applyDisplayScale();
    },
  });

  shopSystem = createShopSystem(player);

  shopSystem = createShopSystem(player);

  engine = new Engine();
  engine.register(inputSystem);
  engine.register(playerSystem);
  engine.register(physicsSystem);
  engine.register(sonarSystem);
  engine.register(missileSystem);
  engine.register(particleSystem);
  engine.register(cameraSystem);
  engine.register(torchSystem);
  engine.register(roomSystem);
  engine.register(resourceManagementSystem);
  engine.register(enemySystem);
  engine.register(pauseMenuSystem);
  engine.register(shopSystem);
}

function drawSegmentedMeter(x, y, w, h, ratio, segments, activeColor, inactiveColor) {
  const safeRatio = Math.max(0, Math.min(1, ratio ?? 0));
  const segmentGap = 3;
  const segmentWidth = (w - segmentGap * (segments - 1)) / segments;
  const litCount = Math.round(safeRatio * segments);

  for (let i = 0; i < segments; i++) {
    const sx = x + i * (segmentWidth + segmentGap);
    noStroke();
    fill(i < litCount ? activeColor : inactiveColor);
    rect(sx, y, segmentWidth, h, 1.5);
  }
}

function drawHudPanel() {
  const coinCount = player?.coins ?? 0;
  const missileCount = player?.missiles ?? 0;
  const powerRatio = player?.power?.getPercent?.() ?? 0;
  const torchLevel = Math.max(1, player?.upgrades?.torch ?? 1);
  const sonarLevel = Math.max(1, player?.upgrades?.sonar ?? 1);
  const torchRadius = Math.round(player?.torch?.radius ?? TORCH.RADIUS);

  const panelX = 20;
  const panelY = 18;
  const panelW = 360;
  const panelH = 148;

  push();
  noStroke();
  fill(4, 14, 20, 210);
  rect(panelX, panelY, panelW, panelH, 10);

  stroke(123, 223, 223, 200);
  strokeWeight(2);
  noFill();
  rect(panelX, panelY, panelW, panelH, 10);

  noStroke();
  fill(17, 34, 44, 240);
  rect(panelX + 10, panelY + 10, panelW - 20, 24, 4);
  fill(220, 237, 242);
  textAlign(LEFT, CENTER);
  textSize(14);
  text("STATUS // EXPLORER UNIT", panelX + 16, panelY + 22);

  fill(198, 255, 170);
  textAlign(RIGHT, CENTER);
  text(`$ ${coinCount}`, panelX + panelW - 16, panelY + 22);

  textAlign(LEFT, CENTER);
  fill(154, 197, 197);
  textSize(11);
  text("POWER", panelX + 16, panelY + 48);
  drawSegmentedMeter(
    panelX + 76,
    panelY + 42,
    176,
    12,
    powerRatio,
    16,
    color(111, 248, 124),
    color(55, 83, 62, 180),
  );
  fill(222, 255, 222);
  textAlign(RIGHT, CENTER);
  text(`${Math.round(powerRatio * 100)}%`, panelX + 252, panelY + 48);

  const missileBoxX = panelX + 265;
  const missileBoxY = panelY + 38;
  noStroke();
  fill(22, 28, 37, 230);
  rect(missileBoxX, missileBoxY, 104, 46, 5);
  stroke(126, 213, 213, 160);
  strokeWeight(1.6);
  noFill();
  rect(missileBoxX, missileBoxY, 104, 46, 5);

  noStroke();
  fill(173, 205, 211);
  textAlign(LEFT, TOP);
  textSize(10);
  text("MISSILES", missileBoxX + 8, missileBoxY + 6);
  fill(missileCount > 0 ? color(255, 216, 120) : color(200, 100, 100));
  textSize(20);
  textAlign(LEFT, TOP);
  text(String(missileCount), missileBoxX + 8, missileBoxY + 18);

  const lowerRowY = panelY + 98;
  fill(154, 197, 197);
  textAlign(LEFT, CENTER);
  textSize(11);
  text("TORCH", panelX + 16, lowerRowY);
  fill(220, 237, 242);
  textSize(12);
  text(`L${torchLevel}  ${torchRadius}px`, panelX + 76, lowerRowY);

  fill(154, 197, 197);
  text("SONAR", panelX + 176, lowerRowY);
  fill(220, 237, 242);
  text(`L${sonarLevel}`, panelX + 226, lowerRowY);

  fill(106, 144, 152);
  textSize(10);
  textAlign(LEFT, CENTER);
  text("B SHOP   E SONAR   L TORCH   SPACE FIRE", panelX + 16, panelY + panelH - 14);
  pop();
}

function draw() {
  frameRate(GAME.FPS);
  if (gameState === "MENU") {
    menuSystem.draw(null);
    return;
  } else if (gameState === "SETTINGS") {
    // Use pauseMenuSystem to render the settings
    pauseMenuSystem.draw();

    // If the back button closed it, return to the start menu
    if (!pauseMenuSystem.isPaused()) {
      gameState = "MENU";
    }
    return;
  }

  if (gameState === WIN_STATE) {
    renderSystem?.draw?.(0);
    winScreenSystem.draw();
    // push(); // placeholder win screen
    // fill(255);
    // stroke(0);
    // strokeWeight(4);
    // textAlign(CENTER, CENTER);
    // textSize(48);
    // text("You Win!", width / 2, height / 2);
    // pop();
    return;
  }

  const currentRoom = roomSystem?.getCurrentRoom?.();
  if (currentRoom && currentRoom !== lastEnsuredRoom) {
    ensureRoomAssetsLoaded(currentRoom);
    lastEnsuredRoom = currentRoom;
  }

  // Shop overlay (blocks all input/gameplay)
  if (shopSystem && shopSystem.isShopOpen()) {
    renderSystem?.draw?.(0);
    shopSystem.draw();
    return;
  }

  accumulator += deltaTime / 1000;

  if (pauseMenuSystem && pauseMenuSystem.isPaused()) {
    // Render last frame + pause overlay only
    pauseMenuSystem.draw();
  } else {
    engine.update(deltaTime);
    renderSystem?.draw?.(deltaTime, 1);
    drawHudPanel();
  }
}

// TODO: input handling in inputsystem
function keyPressed() {
  inputSystem?.onKeyPressed?.(key, keyCode);

  // Always process pause toggle (ESC)
  if (player?.actionIntent?.togglePause) {
    pauseMenuSystem?.togglePause();
    player.actionIntent.togglePause = false;
  }

  // Always process shop toggle (B)
  if (player?.actionIntent?.toggleShop) {
    shopSystem?.toggleShop();
    player.actionIntent.toggleShop = false;
  }

  // Only process other actions if not paused
  if (pauseMenuSystem?.isPaused()) return;
}

function mousePressed() {
  // Shop overlay blocks all clicks
  if (shopSystem?.isShopOpen()) {
    shopSystem?.onMousePressed();
    return;
  }

  if (gameState === WIN_STATE) {
    const selection = winScreenSystem.checkClick(mouseX, mouseY);
    if (selection === "MENU") {
      resetGameToStart();
      gameState = "MENU";
    }
    return;
  }

  if (gameState === "MENU") {
    const selection = menuSystem.checkClick(mouseX, mouseY);

    if (selection === "EASY" || selection === "HARD") {
      startGame(selection);
    } else if (selection === "SETTINGS") {
      gameState = "SETTINGS";
      pauseMenuSystem.openSettingsMenu(true);
    }
    return;
  }

  if (gameState === "SETTINGS") {
    pauseMenuSystem?.onMousePressed();
    return;
  }

  if (shopSystem?.isShopOpen()) {
    shopSystem?.onMousePressed();
    return;
  }

  if (shopSystem?.isShopOpen()) {
    shopSystem?.onMousePressed();
    return;
  }
}

function applyDifficultyConfig(selection) {
  const diffLevel = selection === "EASY" ? "normal" : "hard";

  if (pauseMenuSystem) {
    pauseMenuSystem.setDifficulty(diffLevel);
    console.log(`Game started on ${diffLevel} difficulty.`);
  }
}

function startGame(selection) {
  applyDifficultyConfig(selection);
  gameState = "PLAYING";

  // Ensure no overlay remains active after starting from menu.
  if (pauseMenuSystem?.isPaused?.()) {
    pauseMenuSystem.togglePause();
  }
  shopSystem?.closeShop?.();
}

function mouseDragged() {
  pauseMenuSystem?.onMouseDragged();
}

function mouseReleased() {
  pauseMenuSystem?.onMouseReleased();
}

//--------------------------------------
// DISPLAY SCALING
//--------------------------------------
function applyDisplayScale() {
  const canvasEl = document.querySelector("canvas");
  if (!canvasEl) return;

  const viewportW = window.innerWidth || DISPLAY.WIDTH;
  const viewportH = window.innerHeight || DISPLAY.HEIGHT;

  if (useDevResolution) {
    const scaleX = viewportW / width;
    const scaleY = viewportH / height;
    const s = Math.min(1, Math.min(scaleX, scaleY));
    canvasEl.style.width = Math.max(1, Math.floor(width * s)) + "px";
    canvasEl.style.height = Math.max(1, Math.floor(height * s)) + "px";
    return;
  }

  // Production mode: fit entire canvas in viewport without distortion (no crop).
  const scaleX = viewportW / width;
  const scaleY = viewportH / height;
  const s = Math.min(scaleX, scaleY);
  canvasEl.style.width = Math.max(1, Math.floor(width * s)) + "px";
  canvasEl.style.height = Math.max(1, Math.floor(height * s)) + "px";
}

function windowResized() {
  applyDisplayScale();
}

function resetGameToStart() {
  // 1. Send the player back to the first room
  roomSystem.goToRoom(INITIAL_ROOM_ID, { spawnId: "default" });

  // 2. Snap the player's physical coordinates to the spawn point
  const playerStart = roomSystem.getPlayerStart();
  if (player && playerStart) {
    player.setCurrentPosition(playerStart.x, playerStart.y);
  }

  // 3. Snap the camera back to the start
  if (cameraSystem && playerStart) {
    cameraSystem.snapTo(playerStart.x, playerStart.y);
  }

  // 4. Reset Player stats
  if (player.power) {
    player.power.current = player.power.max || 100;
  }
  if (player.torch) {
    player.torch.isOn = false;
  }

  // 5. Reset Collectables (requires a reset method in resourceManagementSystem)
  if (
    resourceManagementSystem &&
    typeof resourceManagementSystem.reset === "function"
  ) {
    resourceManagementSystem.reset();
  }
}

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.mousePressed = mousePressed;
window.mouseDragged = mouseDragged;
window.mouseReleased = mouseReleased;
window.windowResized = windowResized;

