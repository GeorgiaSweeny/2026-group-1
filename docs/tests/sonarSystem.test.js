//======================================
// UNIT TESTS - SONAR SYSTEM
//======================================
/*
Tests for sonarSystem.js — verifies pulse emission, cooldown,
wall/hazard/collectable/enemy reveal, and pulse lifecycle.

Note: Pulse class uses p5.Vector for particle velocities.
We test at the SonarSystem level (createSonarSystem) rather than
testing Pulse directly, since Pulse is a private inner class.
*/

import { jest } from '@jest/globals';

const TIME_MOCK = { fixedDeltaTime: 1 / 60 };

// Use COOLDOWN_MS = 1 so cooldown expires in ~100 updates (0.01 per update × 100 = 1)
jest.unstable_mockModule('../config.js', () => ({
  SONAR: { COOLDOWN_MS: 1, RAY_SPEED: 2 },
  TIME: TIME_MOCK,
  DEBUG_COLOR: { WALL: 'red' },
}));

// Mock p5 globals for Pulse constructor
function makeVector(x, y) {
  return { x, y, mult(s) { return makeVector(x * s, y * s); } };
}

global.createVector = jest.fn((x, y) => makeVector(x, y));
global.TWO_PI = Math.PI * 2;
global.p5 = { Vector: { fromAngle: (a) => makeVector(Math.cos(a), Math.sin(a)) } };
global.print = jest.fn();

const { createSonarSystem } = await import('../systems/sonarSystem.js');

describe('SonarSystem', () => {
  let player;
  let mockSoundSystem;

  function makePlayer(overrides = {}) {
    return {
      actionIntent: { emitSonar: false },
      position: { x: 100, y: 100 },
      x: 100,   // used by sonar when getX/getY don't exist
      y: 100,
      bubbles: [],
      ...overrides,
    };
  }

  beforeEach(() => {
    player = makePlayer();
    mockSoundSystem = { play: jest.fn() };
  });

  //======================================
  // PULSE CREATION
  //======================================

  describe('pulse creation', () => {
    it('creates a pulse when emitSonar intent is set', () => {
      player.actionIntent.emitSonar = true;
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      sonar.update();
      expect(sonar.getActivePulses().length).toBe(1);
    });

    it('consumes emitSonar intent after triggering', () => {
      player.actionIntent.emitSonar = true;
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      sonar.update();
      expect(player.actionIntent.emitSonar).toBe(false);
    });

    it('plays sonarPing sound on pulse creation', () => {
      player.actionIntent.emitSonar = true;
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      sonar.update();
      expect(mockSoundSystem.play).toHaveBeenCalledWith('sonarPing', 0.8);
    });

    it('does not create pulse if no emitSonar intent', () => {
      player.actionIntent.emitSonar = false;
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      sonar.update();
      expect(sonar.getActivePulses().length).toBe(0);
    });
  });

  //======================================
  // COOLDOWN
  //======================================

  describe('cooldown', () => {
    it('prevents pulse creation during cooldown', () => {
      player.actionIntent.emitSonar = true;
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      sonar.update(); // first pulse
      expect(sonar.getActivePulses().length).toBe(1);

      // Try to fire again while in cooldown
      player.actionIntent.emitSonar = true;
      sonar.update();
      expect(sonar.getActivePulses().length).toBe(1); // still only 1
    });

    it('getCooldownPercent returns 0 when not in cooldown', () => {
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      expect(sonar.getCooldownPercent()).toBe(0);
    });

    it('allows pulse after cooldown expires', () => {
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);

      // First pulse — cooldown starts at 0, so pulse is created (cooldownTimer = COOLDOWN_MS = 500)
      player.actionIntent.emitSonar = true;
      sonar.update();
      expect(sonar.getActivePulses().length).toBe(1);
      // cooldownTimer is now 500; cooldownPercent ≈ 1.0

      // Do NOT set emitSonar here — just run the cooldown down by repeatedly calling update.
      // Each update reduces cooldownTimer by 0.01. COOLDOWN_MS = 1, so needs 100+ updates to expire.
      for (let i = 0; i < 105; i++) sonar.update();

      // After 60 updates cooldownTimer ≈ max(0, 500 - 600*0.01) = 0 (expired)
      // Now fire again
      player.actionIntent.emitSonar = true;
      sonar.update();
      expect(sonar.getActivePulses().length).toBe(2);
    });
  });

  //======================================
  // PULSE LIFECYCLE
  //======================================

  describe('pulse lifecycle', () => {
    it('adds pulse to activePulses list after creation', () => {
      player.actionIntent.emitSonar = true;
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      sonar.update();
      const pulses = sonar.getActivePulses();
      expect(pulses.length).toBe(1);
      expect(pulses[0]).toBeDefined();
    });

    it('getActivePulses returns empty array initially', () => {
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      expect(sonar.getActivePulses()).toEqual([]);
    });
  });

  //======================================
  // EDGE CASES
  //======================================

  describe('edge cases', () => {
    it('handles null soundSystem without throwing', () => {
      player.actionIntent.emitSonar = true;
      const sonar = createSonarSystem(player, () => [], () => [], () => [], null, () => []);
      expect(() => sonar.update()).not.toThrow();
    });

    it('handles empty walls/collectables/enemies arrays', () => {
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      expect(() => sonar.update()).not.toThrow();
    });

    it('handles player with no actionIntent', () => {
      const badPlayer = { position: { x: 100, y: 100 } };
      const sonar = createSonarSystem(badPlayer, () => [], () => [], () => [], mockSoundSystem, () => []);
      expect(() => sonar.update()).not.toThrow();
    });

    it('getRevealedWalls returns empty array with no walls', () => {
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      expect(sonar.getRevealedWalls()).toEqual([]);
    });

    it('getRevealedHazards returns empty array with no hazards', () => {
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      expect(sonar.getRevealedHazards()).toEqual([]);
    });

    it('getRevealedCollectables returns empty array with no collectables', () => {
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      expect(sonar.getRevealedCollectables()).toEqual([]);
    });

    it('getRevealedEnemies returns empty array with no enemies', () => {
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      expect(sonar.getRevealedEnemies()).toEqual([]);
    });

    it('handles null getWalls callback', () => {
      const sonar = createSonarSystem(player, null, () => [], () => [], mockSoundSystem, () => []);
      expect(() => sonar.update()).not.toThrow();
    });

    it('handles getCollectables returning non-array', () => {
      const sonar = createSonarSystem(player, () => [], () => null, () => [], mockSoundSystem, () => []);
      expect(() => sonar.update()).not.toThrow();
    });
  });
});
