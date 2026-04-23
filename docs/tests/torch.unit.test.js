/*
========================================
TESTS: torch.js
AUTHOR: Georgia Sweeny
========================================
*/

import { Torch } from '../entities/components/torch.js';
import { TORCH, TIME } from '../config.js';

//======================================
// HELPERS
//======================================

function makeTorch(overrides = {}) {
   return new Torch({ ...TORCH, ...overrides });
}

// Sample getIntensity across many timer values, return all non-null results
function sampleIntensity(torch, powerPercent, steps = 500) {
   const results = [];
   for (let i = 0; i < steps; i++) {
      torch.flickerTimer = i * 0.1;
      results.push(torch.getIntensity(powerPercent));
   }
   return results;
}

//======================================
// CONSTRUCTOR
//======================================

describe('Torch — constructor', () => {
   it('initialises isOn to false', () => {
      const torch = makeTorch();
      expect(torch.isOn).toBe(false);
   });

   it('initialises flickerTimer to 0', () => {
      const torch = makeTorch();
      expect(torch.flickerTimer).toBe(0);
   });

   it('sets radius and baseRadius from config', () => {
      const torch = makeTorch({ RADIUS: 120 });
      expect(torch.radius).toBe(120);
      expect(torch.baseRadius).toBe(120);
   });

   it('clamps gentleIntensityRange to 0 for negative values', () => {
      const torch = makeTorch({ GENTLE_INTENSITY_RANGE: -0.5 });
      expect(torch.gentleIntensityRange).toBe(0);
   });

   it('clamps gentleIntensityRange to 1 for values above 1', () => {
      const torch = makeTorch({ GENTLE_INTENSITY_RANGE: 1.5 });
      expect(torch.gentleIntensityRange).toBe(1);
   });

   it('clamps dyingIntensityRange to 0 for negative values', () => {
      const torch = makeTorch({ DYING_INTENSITY_RANGE: -0.5 });
      expect(torch.dyingIntensityRange).toBe(0);
   });

   it('clamps dyingIntensityRange to 1 for values above 1', () => {
      const torch = makeTorch({ DYING_INTENSITY_RANGE: 1.5 });
      expect(torch.dyingIntensityRange).toBe(1);
   });
});

//======================================
// tryToggle
//======================================

describe('Torch — tryToggle', () => {
   it('turns on when hasPower is true and torch is off', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      expect(torch.isOn).toBe(true);
   });

   it('does not turn on when hasPower is false', () => {
      const torch = makeTorch();
      torch.tryToggle(false);
      expect(torch.isOn).toBe(false);
   });

   it('turns off when already on', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      torch.tryToggle(true);
      expect(torch.isOn).toBe(false);
   });

   it('turns off regardless of hasPower when already on', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      torch.tryToggle(false);
      expect(torch.isOn).toBe(false);
   });

   it('resets flickerTimer to 0 on toggle on', () => {
      const torch = makeTorch();
      torch.flickerTimer = 99;
      torch.tryToggle(true);
      expect(torch.flickerTimer).toBe(0);
   });

   it('resets flickerTimer to 0 on toggle off', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      torch.flickerTimer = 99;
      torch.tryToggle(true);
      expect(torch.flickerTimer).toBe(0);
   });
});

//======================================
// update
//======================================

describe('Torch — update', () => {
   it('does not advance flickerTimer when torch is off', () => {
      const torch = makeTorch();
      torch.update();
      expect(torch.flickerTimer).toBe(0);
   });

   it('advances flickerTimer by fixedDeltaTime when torch is on', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      torch.update();
      expect(torch.flickerTimer).toBeCloseTo(TIME.fixedDeltaTime);
   });

   it('accumulates flickerTimer across multiple updates', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      torch.update();
      torch.update();
      expect(torch.flickerTimer).toBeCloseTo(TIME.fixedDeltaTime * 2);
   });
});

//======================================
// setUpgradeLevel
//======================================

describe('Torch — setUpgradeLevel', () => {
   it('level 1 gives base radius', () => {
      const torch = makeTorch({ RADIUS: 100, UPGRADE_RADIUS_BONUS: 22 });
      torch.setUpgradeLevel(1);
      expect(torch.radius).toBe(100);
   });

   it('level 2 gives base radius plus one bonus', () => {
      const torch = makeTorch({ RADIUS: 100, UPGRADE_RADIUS_BONUS: 22 });
      torch.setUpgradeLevel(2);
      expect(torch.radius).toBe(122);
   });

   it('level 3 gives base radius plus two bonuses', () => {
      const torch = makeTorch({ RADIUS: 100, UPGRADE_RADIUS_BONUS: 22 });
      torch.setUpgradeLevel(3);
      expect(torch.radius).toBe(144);
   });

   it('level 0 is treated as level 1 — no penalty below base', () => {
      const torch = makeTorch({ RADIUS: 100, UPGRADE_RADIUS_BONUS: 22 });
      torch.setUpgradeLevel(0);
      expect(torch.radius).toBe(100);
   });

   it('negative level safely defaults to level 1 minimum — base radius returned', () => {
      const torch = makeTorch({ RADIUS: 100, UPGRADE_RADIUS_BONUS: 22 });
      torch.setUpgradeLevel(-5);
      expect(torch.radius).toBe(100);
   });
});

//======================================
// getIntensity
//======================================

describe('Torch — getIntensity', () => {
   it('returns 0 when torch is off regardless of power', () => {
      const torch = makeTorch();
      expect(torch.getIntensity(1.0)).toBe(0);
      expect(torch.getIntensity(0.0)).toBe(0);
   });

   it('returns 1 when power is above flickerThreshold', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      expect(torch.getIntensity(TORCH.FLICKER_POWER_THRESHOLD + 0.01)).toBe(1);
      expect(torch.getIntensity(1.0)).toBe(1);
   });

   it('never returns a value outside [0, 1] at the flicker threshold boundary', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      const results = sampleIntensity(torch, TORCH.FLICKER_POWER_THRESHOLD);
      results.forEach(v => {
         expect(v).toBeGreaterThanOrEqual(0);
         expect(v).toBeLessThanOrEqual(1);
      });
   });

   it('never returns a value outside [0, 1] at the blackout threshold boundary', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      const results = sampleIntensity(torch, TORCH.BLACKOUT_POWER_THRESHOLD);
      results.forEach(v => {
         expect(v).toBeGreaterThanOrEqual(0);
         expect(v).toBeLessThanOrEqual(1);
      });
   });

   it('never returns a value outside [0, 1] at power 0', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      const results = sampleIntensity(torch, 0);
      results.forEach(v => {
         expect(v).toBeGreaterThanOrEqual(0);
         expect(v).toBeLessThanOrEqual(1);
      });
   });

   it('above blackout threshold: non-zero intensity stays within gentle range', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      const powerAboveBlackout = TORCH.BLACKOUT_POWER_THRESHOLD + 0.01;
      const results = sampleIntensity(torch, powerAboveBlackout);
      const nonZero = results.filter(v => v > 0);
      const min = 1.0 - TORCH.GENTLE_INTENSITY_RANGE;
      nonZero.forEach(v => {
         expect(v).toBeGreaterThanOrEqual(min);
         expect(v).toBeLessThanOrEqual(1);
      });
   });

   it('below blackout threshold: non-zero intensity stays within dying range', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      const powerBelowBlackout = TORCH.BLACKOUT_POWER_THRESHOLD - 0.01;
      const results = sampleIntensity(torch, powerBelowBlackout);
      const nonZero = results.filter(v => v > 0);
      const min = 1.0 - TORCH.DYING_INTENSITY_RANGE;
      nonZero.forEach(v => {
         expect(v).toBeGreaterThanOrEqual(min);
         expect(v).toBeLessThanOrEqual(1);
      });
   });

   it('never returns a negative value across all power levels', () => {
      const torch = makeTorch();
      torch.tryToggle(true);
      [1.0, 0.15, 0.10, 0.05, 0.01, 0].forEach(power => {
         const results = sampleIntensity(torch, power);
         results.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
      });
   });
});
