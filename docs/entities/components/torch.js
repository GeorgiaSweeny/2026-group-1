/*
========================================
VERSION: 2.4
ENTITY: TORCH
AUTHOR: Georgia Sweeny
DESCRIPTION:
- Torch entity: represents a light source held by the player
- Handles flicker, intensity, and on/off state based on available power

RULES:
- Torch class does not handle player input directly
- Torch class does not perform physics or collisions
- Torch class does not render itself; rendering is handled by renderSystem
========================================
DESIGN GOALS:
- Simulate natural flicker and dying-light behavior
- Keep torch logic modular and independent from other systems
- Provide smooth intensity values for dynamic lighting
========================================
RESPONSIBILITIES:
- Maintain on/off state
- Track internal flicker timer
- Compute visible intensity based on power percentage
- Provide getIntensity() method for lighting system

DEPENDENCIES:
- Config object with RADIUS and FLICKER_POWER_THRESHOLD
- PowerSystem (for external gating; passed as argument to toggle)

USAGE:
import { Torch } from './torch.js';
const torch = new Torch(TORCH_CONFIG);
torch.update();
const intensity = torch.getIntensity(player.power.getPercent());
========================================
*/


//======================
// TORCH CLASS
//======================
import { TIME } from '../../config.js';

export class Torch {
   constructor(config) {
      // Config-driven defaults
      this.baseRadius = config.RADIUS;
      this.radius = config.RADIUS;
      this.upgradeBonusPerLevel = config.UPGRADE_RADIUS_BONUS ?? 20;

      // Runtime state
      this.flickerTimer = 0;
      this.isOn = false;

      // Flicker behavior tuning
      this.flickerSpeed = config.FLICKER_SPEED;
      this.flickerThreshold = config.FLICKER_POWER_THRESHOLD;   // flicker starts below this
      this.blackoutThreshold = config.BLACKOUT_POWER_THRESHOLD; // blackouts start below this

      // Intensity ranges (base is implicit: 1.0 - range), clamped to [0, 1]
      this.gentleIntensityRange = Math.max(0, Math.min(1, config.GENTLE_INTENSITY_RANGE));
      this.dyingIntensityRange  = Math.max(0, Math.min(1, config.DYING_INTENSITY_RANGE));

      // Dropout thresholds (deterministic sine wave cutoffs, not random chances)
      this.sputterBaseThreshold = config.SPUTTER_BASE_THRESHOLD;
      this.sputterScaling = config.SPUTTER_SCALING;
      this.burstBaseThreshold = config.BURST_BASE_THRESHOLD;
      this.burstScaling = config.BURST_SCALING;
   }

   // Set radius based on upgrade level (level 1 = base radius)
   setUpgradeLevel(level) {
      this.radius = this.baseRadius + (Math.max(1, level) - 1) * this.upgradeBonusPerLevel;
   }

   // Toggle torch on/off
   tryToggle(hasPower) {
      if (this.isOn) {
         this.isOn = false;
      } else if (hasPower) {
         this.isOn = true;
      }

      this.flickerTimer = 0;
   }

   // Update internal flicker timer
   update() {
      if (!this.isOn) return;
      this.flickerTimer += TIME.fixedDeltaTime;
   }

   // Returns smooth intensity between 0 (off) and 1 (full brightness)
   getIntensity(powerPercent) {
      if (!this.isOn) return 0;

      // If player has enough power, full brightness
      if (powerPercent > this.flickerThreshold) return 1;

      // Low power: "dying bulb" flicker with jitter and dropouts
      const safePower = Math.max(0, Math.min(powerPercent ?? 0, this.flickerThreshold));
      const lowPowerRatio = 1 - safePower / this.flickerThreshold; // 0..1, higher = lower power
      const blackoutRatio = powerPercent <= this.blackoutThreshold
         ? 1 - Math.max(0, powerPercent) / this.blackoutThreshold
         : 0;

      // Above blackout threshold: slow gentle flicker; below: rapid dying-bulb speed
      const gentleSpeedBase = 10;
      const gentleSpeedRange = 5;
      const dyingSpeedBase = 8;
      const dyingSpeedRange = 20;
      const flickerSpeed = powerPercent > this.blackoutThreshold
         ? this.flickerSpeed * (gentleSpeedBase + lowPowerRatio * gentleSpeedRange)
         : this.flickerSpeed * (dyingSpeedBase + blackoutRatio * dyingSpeedRange);

      const t = this.flickerTimer * flickerSpeed;
      const baseWave = (Math.sin(t) + 1) / 2;
      const jitterFreq = 2.7;
      const jitterMod = 0.31;
      const jitterDepth = 1.8;
      const jitterWave = (Math.sin(t * jitterFreq + Math.sin(t * jitterMod) * jitterDepth) + 1) / 2;
      const baseWaveWeight = 0.45;
      const jitterWaveWeight = 0.55;
      const combined = baseWaveWeight * baseWave + jitterWaveWeight * jitterWave;

      // Micro-dropouts begin at flicker threshold
      const sputterFreq = 5.9;
      const sputterGate = (Math.sin(t * sputterFreq) + 1) / 2;
      if (sputterGate < this.sputterBaseThreshold + lowPowerRatio * this.sputterScaling) return 0;

      // Blackout bursts only begin below the blackout threshold
      if (powerPercent <= this.blackoutThreshold) {
         const burstFreq = 0.7;
         const burstModFreq = 0.13;
         const burstModDepth = 2.0;
         const burstGate = (Math.sin(t * burstFreq + Math.sin(t * burstModFreq) * burstModDepth) + 1) / 2;
         if (burstGate < this.burstBaseThreshold + blackoutRatio * this.burstScaling) return 0;
      }

      // Above blackout threshold: subtle flicker keeps radius close to full
      // Below blackout threshold: full dying-bulb range lets radius shrink
      if (powerPercent > this.blackoutThreshold) {
         return (1.0 - this.gentleIntensityRange) + this.gentleIntensityRange * combined;
      }
      return (1.0 - this.dyingIntensityRange) + this.dyingIntensityRange * combined;
   }
}
//======================================
// END
//======================================
