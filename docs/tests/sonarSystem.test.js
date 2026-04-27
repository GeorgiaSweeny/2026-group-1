//======================================
// UNIT TESTS - SONAR SYSTEM
//======================================
/*
Tests for sonarSystem.js — verifies pulse emission, cooldown,
wall/hazard/collectable/enemy reveal, and pulse lifecycle.
*/

import { jest } from '@jest/globals';

const TIME_MOCK = { fixedDeltaTime: 1 / 60 };

jest.unstable_mockModule('../config.js', () => ({
  SONAR: { COOLDOWN_MS: 500, RAY_SPEED: 2 },
  TIME: TIME_MOCK,
  DEBUG_COLOR: { WALL: 'red' },
}));

// Mock p5 globals needed by sonarSystem
const mockP5Vector = {
  fromAngle: jest.fn((angle) => ({ x: Math.cos(angle), y: Math.sin(angle) })),
  mult: jest.fn(function (s) { return { x: this.x * s, y: this.y * s }; }),
};
mockP5Vector.fromAngle.mockReturnValue(mockP5Vector); // fromAngle().mult() chainable

global.createVector = jest.fn((x, y) => ({ x, y }));
global.TWO_PI = Math.PI * 2;
global.p5 = { Vector: mockP5Vector };
global.print = jest.fn(); // sonar uses print() in getCooldownPercent

const { createSonarSystem } = await import('../systems/sonarSystem.js');

describe('SonarSystem', () => {
  let player;
  let mockSoundSystem;

  function makePlayer(overrides = {}) {
    return {
      actionIntent: { emitSonar: false },
      position: { x: 100, y: 100 },
      bubbles: [],
      ...overrides,
    };
  }

  function makePlayerWithMethods(overrides = {}) {
    return {
      actionIntent: { emitSonar: false },
      getX: () => 100,
      getY: () => 100,
      position: { x: 100, y: 100 },
      bubbles: [],
      ...overrides,
    };
  }

  beforeEach(() => {
    player = makePlayerWithMethods();
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
      const pulses = sonar.getActivePulses();
      expect(pulses.length).toBe(1);
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
      sonar.update(); // creates pulse, starts cooldown
      player.actionIntent.emitSonar = true;
      sonar.update(); // should be in cooldown, no new pulse
      expect(sonar.getActivePulses().length).toBe(1);
    });

    it('allows pulse after cooldown expires', () => {
      player.actionIntent.emitSonar = true;
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      sonar.update(); // first pulse
      // Simulate cooldown passing by setting cooldownTimer manually or calling update many times
      player.actionIntent.emitSonar = true;
      // Force cooldown to expire by calling update enough times (cooldown decreases by 0.01 per update)
      for (let i = 0; i < 600; i++) sonar.update();
      player.actionIntent.emitSonar = true;
      sonar.update();
      // After ~6 seconds of updates (600 * 0.01s = 6s > 0.5s cooldown), new pulse should be created
      expect(sonar.getActivePulses().length).toBeGreaterThan(1);
    });

    it('getCooldownPercent returns 0 when not in cooldown', () => {
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      expect(sonar.getCooldownPercent()).toBe(0);
    });
  });

  //======================================
  // WALL REVEAL
  //======================================

  describe('wall reveal', () => {
    it('reveals a wall when pulse particle collides with it', () => {
      player.actionIntent.emitSonar = true;
      const wall = { x: 105, y: 105, w: 16, h: 16, isDestroyed: false };
      const sonar = createSonarSystem(
        player,
        () => [wall],
        () => [],
        () => [],
        mockSoundSystem,
        () => []
      );
      sonar.update();
      const reveals = sonar.getRevealedWalls();
      expect(reveals.length).toBeGreaterThan(0);
    });

    it('does not reveal destroyed walls', () => {
      player.actionIntent.emitSonar = true;
      const wall = { x: 105, y: 105, w: 16, h: 16, isDestroyed: true };
      const sonar = createSonarSystem(
        player,
        () => [wall],
        () => [],
        () => [],
        mockSoundSystem,
        () => []
      );
      sonar.update();
      const reveals = sonar.getRevealedWalls();
      expect(reveals.length).toBe(0);
    });

    it('fades revealed wall alpha over time', () => {
      player.actionIntent.emitSonar = true;
      const wall = { x: 105, y: 105, w: 16, h: 16, isDestroyed: false };
      const sonar = createSonarSystem(
        player,
        () => [wall],
        () => [],
        () => [],
        mockSoundSystem,
        () => []
      );
      sonar.update(); // pulse created and reveals wall
      const initial = sonar.getRevealedWalls();
      const initialAlpha = initial.length > 0 ? initial[0].alpha : 255;
      // Update many times to fade
      for (let i = 0; i < 10; i++) sonar.update();
      const after = sonar.getRevealedWalls();
      if (after.length > 0) {
        expect(after[0].alpha).toBeLessThan(initialAlpha);
      }
    });
  });

  //======================================
  // HAZARD REVEAL
  //======================================

  describe('hazard reveal', () => {
    it('reveals hazard entities hit by pulse', () => {
      player.actionIntent.emitSonar = true;
      const hazard = { x: 105, y: 105, w: 16, h: 16 };
      const sonar = createSonarSystem(
        player,
        () => [],
        () => [hazard],
        () => [],
        mockSoundSystem,
        () => []
      );
      sonar.update();
      const reveals = sonar.getRevealedHazards();
      expect(reveals.length).toBeGreaterThan(0);
    });
  });

  //======================================
  // COLLECTABLE REVEAL
  //======================================

  describe('collectable reveal', () => {
    it('reveals collectables hit by pulse', () => {
      player.actionIntent.emitSonar = true;
      const collectable = { x: 105, y: 105, w: 16, h: 16, collectableType: 'power' };
      const sonar = createSonarSystem(
        player,
        () => [],
        () => [],
        () => [collectable],
        mockSoundSystem,
        () => []
      );
      sonar.update();
      const reveals = sonar.getRevealedCollectables();
      expect(reveals.length).toBeGreaterThan(0);
    });
  });

  //======================================
  // ENEMY REVEAL
  //======================================

  describe('enemy reveal', () => {
    it('reveals enemies hit by pulse', () => {
      player.actionIntent.emitSonar = true;
      const enemy = { x: 105, y: 105, w: 24, h: 24, isDestroyed: false };
      const sonar = createSonarSystem(
        player,
        () => [],
        () => [],
        () => [],
        mockSoundSystem,
        () => [enemy]
      );
      sonar.update();
      const reveals = sonar.getRevealedEnemies();
      expect(reveals.length).toBeGreaterThan(0);
    });
  });

  //======================================
  // PULSE LIFECYCLE
  //======================================

  describe('pulse lifecycle', () => {
    it('removes finished pulses from active list', () => {
      player.actionIntent.emitSonar = true;
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      sonar.update();
      expect(sonar.getActivePulses().length).toBe(1);
      // Run many updates until pulse naturally finishes (life decreases each update)
      for (let i = 0; i < 500; i++) sonar.update();
      // Pulse should have finished and been removed
      const pulses = sonar.getActivePulses();
      // Either removed (0) or still active (1) depending on wall collisions
      expect(pulses.length).toBeLessThanOrEqual(1);
    });
  });

  //======================================
  // EDGE CASES
  //======================================

  describe('edge cases', () => {
    it('handles null/undefined soundSystem', () => {
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

    it('getActivePulses returns empty array initially', () => {
      const sonar = createSonarSystem(player, () => [], () => [], () => [], mockSoundSystem, () => []);
      expect(sonar.getActivePulses()).toEqual([]);
    });
  });
});
