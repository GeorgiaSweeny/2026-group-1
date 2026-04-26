/*
========================================
VERSION: 3.0
SYSTEM: LIGHTING SYSTEM
AUTHOR: Georgia Sweeny
DESCRIPTION:
- Computes dynamic light sources for the game world
- Provides data for renderSystem to draw lighting effects
- Handles intensity and visibility of lights (e.g., player torch)

RULES:
- Lighting system does not perform actual drawing
- Lighting system does not modify game state
- Purely read-only: calculates light data for consumption by renderer
========================================
DESIGN GOALS:
- Centralize light source computation
- Support multiple light sources (player, enemies, etc.)
- Allow intensity and flicker effects without side effects
========================================
RESPONSIBILITIES:
- Provide a method to get current light sources
- Compute positions, radius, and intensity of each light
- Include flicker and intensity adjustments based on entity state

DEPENDENCIES:
- Player object with torch and power properties
- Optional array of enemies with light sources
- Uses torch.getIntensity(powerPercent) for smooth light intensity

USAGE:
const lightingSystem = createLightingSystem(player, enemies, etc. = []);
const lightSources = lightingSystem.getLightSources();
========================================
NOTES:
- Designed to be called each frame before rendering
- Can easily be extended to include enemy or environmental lights
- Returns array of objects: {x, y, radius, intensity}
========================================
TODO / LIMITATIONS:
- Currently only player torch implemented
- No ambient or environmental light sources yet
========================================
*/

//======================================
// LIGHTING SYSTEM
//======================================
import { LIGHTING, TORCH } from '../config.js';

// theSurface room vertical bounds (world-space pixels)
const SURFACE_BOTTOM_Y = 3184; // player spawn row — darkest point
const SURFACE_TOP_Y    = 320;  // win trigger row  — brightest point
const SURFACE_CENTER_X = 720;  // horizontal centre of the room

function _surfaceT(playerY) {
   const raw = (SURFACE_BOTTOM_Y - playerY) / (SURFACE_BOTTOM_Y - SURFACE_TOP_Y);
   return Math.max(0, Math.min(1, raw));
}

export function createLightingSystem(player = null, getSonarLights = () => [], getGlowLights = () => [], getCurrentRoom = () => null) {
   return {

      //--- GET LIGHT SOURCES ---//
      getLightSources() {
         if (!player) return [];
         const x = player.position?.x ?? player.x ?? 0;
         const y = player.position?.y ?? player.y ?? 0;
         const lightSources = [];

         // Player torch
         if (player.torch?.isOn) {
            const intensity = player.torch.getIntensity(player.power?.getPercent?.() ?? 0);
            if (intensity > 0) {
               lightSources.push({
                  kind: 'torch',
                  x,
                  y,
                  radius: TORCH.RADIUS, // if upgrades added replace with player.torch.radius
                  intensity
               });
            }
         } else {
            // Torch off — ambient only
            lightSources.push({
               kind: 'ambient',
               x,
               y,
               radius: LIGHTING.PLAYER_AMBIENT.RADIUS,
               intensity: LIGHTING.PLAYER_AMBIENT.BRIGHTNESS
            });
         }

         // Sonar lights
         const sonarLights = getSonarLights?.() ?? [];
         for (const light of sonarLights) {
            lightSources.push(light);
         }

         // Glow object lights
         const glowLights = getGlowLights?.() ?? [];
         for (const light of glowLights) {
            lightSources.push(light);
         }

         // Surface room: growing ambient + sky glow as player climbs
         if (getCurrentRoom?.() === 'theSurface') {
            const t = _surfaceT(y);
            const tSmooth = t * t;

            // Expanding ambient halo around the player
            lightSources.push({
               kind: 'surface',
               x,
               y,
               radius: 60 + tSmooth * 340,
               intensity: 0.3 + tSmooth * 0.7,
            });

            // Sky glow bleeds in from above during the top 40% of the climb
            if (t > 0.6) {
               const glowT = (t - 0.6) / 0.4;
               lightSources.push({
                  kind: 'skyGlow',
                  x: SURFACE_CENTER_X,
                  y: SURFACE_TOP_Y,
                  radius: 200 + glowT * 600,
                  intensity: glowT,
               });
            }
         }

         return lightSources;
      },

      // Returns darkness layer alpha (0-255) for the current frame.
      // Full opacity everywhere except theSurface, where it fades as the player rises.
      getSurfaceDarknessAlpha() {
         if (getCurrentRoom?.() !== 'theSurface' || !player) return 255;
         const y = player.position?.y ?? player.y ?? 0;
         const tSmooth = _surfaceT(y) ** 2;
         return Math.round(255 * (1 - tSmooth * 0.75));
      },
   };
}
//======================================
// END
//======================================
