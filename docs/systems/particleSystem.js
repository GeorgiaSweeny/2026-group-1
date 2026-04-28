/*
========================================
VERSION: 1.0
SYSTEM: PARTICLE SYSTEM
AUTHOR: Archie Brown
DESCRIPTION:
- Creates ambient particle effects throughout the game world
- Particles avoid collision tiles for a natural effect
- Provides smooth, ambient atmospherics to enhance atmosphere

RULES:
- Particles do not spawn on solid collision tiles
- Rendering is handled by renderSystem
- No physics interaction with game objects

DESIGN GOALS:
- Create immersive ambient atmosphere
- Keep particle generation efficient
- Avoid spawning in solid areas

RESPONSIBILITIES:
- Generate new particles at intervals
- Update particle positions, velocity, and lifecycles
- Remove expired particles
- Provide particle data to renderSystem

DEPENDENCIES:
- Player position for reference
- Room collision data to avoid spawning in walls
- Camera for viewport calculations

USAGE:
import { createParticleSystem } from './particleSystem.js';
const particleSystem = createParticleSystem(player, () => roomSystem.getCollisionTileData());
engine.register(particleSystem);
========================================
*/

//======================================
// PARTICLE SYSTEM
//======================================
export function createParticleSystem(player, getCollisionData) {
  const particles = [];
  const burstParticles = [];
  const maxParticles = 150;
  let spawnTimer = 0;
  const spawnInterval = 3; // frames between spawns

  // Collision tile ID that blocks particle spawning
  const COLLISION_TILE_ID = 23;

  function isCollisionTile(x, y, collisionData) {
    if (!collisionData) return false;

    // Get tile size from canvas
    const TILE_SIZE = 16;
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    // Check bounds
    if (tileX < 0 || tileY < 0 || tileX >= 50 || tileY >= 50) return false;

    // Get tile index from flattened array (50x50 grid)
    const tileIndex = tileY * 50 + tileX;

    if (tileIndex >= 0 && tileIndex < collisionData.length) {
      return collisionData[tileIndex] === COLLISION_TILE_ID;
    }

    return false;
  }

  function createParticle(x, y) {
    return {
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.3 - 0.1, // Drift upward
      life: 255,
      maxLife: 255,
      size: Math.random() * 2 + 1,
      type: Math.random() > 0.7 ? 'dust' : 'float' // Mostly float particles
    };
  }

  function getRandomSpawnPoint(collisionData) {
    const attempts = 5;
    const TILE_SIZE = 16;

    for (let i = 0; i < attempts; i++) {
      // Spawn around player with some offset
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 150;
      const spawnX = player.x + Math.cos(angle) * distance;
      const spawnY = player.y + Math.sin(angle) * distance;

      // Check if this is not a collision tile
      if (!isCollisionTile(spawnX, spawnY, collisionData)) {
        return { x: spawnX, y: spawnY };
      }
    }

    return null; // Could not find valid spawn point
  }

  return {
    update() {
      const collisionData = getCollisionData?.() ?? null;

      spawnTimer++;

      // Spawn new particles
      if (spawnTimer >= spawnInterval && particles.length < maxParticles) {
        const spawnPoint = getRandomSpawnPoint(collisionData);
        if (spawnPoint) {
          particles.push(createParticle(spawnPoint.x, spawnPoint.y));
          spawnTimer = 0;
          console.log(`[particles] spawned at (${Math.round(spawnPoint.x)}, ${Math.round(spawnPoint.y)}), total: ${particles.length}`);
        }
      }

      // Update existing particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Physics
        p.x += p.vx;
        p.y += p.vy;

        // Fade out
        p.life -= 0.8;

        // Remove if dead
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      // Update burst particles
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p = burstParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.life -= 3;
        p.size *= 0.97;
        if (p.life <= 0 || p.size < 0.3) {
          burstParticles.splice(i, 1);
        }
      }
    },

    emitBurst(x, y, type = 'enemy') {
      // type: 'enemy' | 'wall'
      const count = 20;
      const palette = type === 'wall'
        ? [
            { r: 150, g: 130, b: 110 },
            { r: 120, g: 100, b: 85 },
            { r: 100, g: 85, b: 70 },
            { r: 180, g: 160, b: 130 },
          ]
        : [
            { r: 255, g: 80, b: 40 },
            { r: 255, g: 140, b: 30 },
            { r: 200, g: 60, b: 20 },
            { r: 255, g: 200, b: 50 },
          ];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        const col = palette[Math.floor(Math.random() * palette.length)];
        burstParticles.push({
          x: x + (Math.random() - 0.5) * 16,
          y: y + (Math.random() - 0.5) * 16,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          life: 200 + Math.random() * 100,
          maxLife: 300,
          size: 3 + Math.random() * 5,
          type: 'burst',
          r: col.r,
          g: col.g,
          b: col.b,
        });
      }
    },

    getParticles() {
      return particles;
    },

    getBurstParticles() {
      return burstParticles;
    },

    clearParticles() {
      particles.length = 0;
      burstParticles.length = 0;
    }
  };
}

//======================================
// END
//======================================
