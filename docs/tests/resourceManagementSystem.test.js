//======================================
// UNIT TESTS - RESOURCE MANAGEMENT SYSTEM
//======================================
/*
Tests for resourceManagementSystem.js — verifies collectable pickup,
hazard drain, enemy contact, difficulty scaling, and reset.
*/

import { jest } from '@jest/globals';

// Mock ALL config.js exports that any statically-imported module might need
jest.unstable_mockModule('../config.js', () => ({
  DEBUG_COLOR: { WALL: 'red', PLAYER: 'blue', ENEMY: 'green' },
  TIME: { fixedDeltaTime: 1 / 60 },
  CANVAS: { TILE_SIZE: 16 },
  COMBAT: { IFRAME_DURATION_MS: 500 },
  DIFFICULTY: {
    easy: { POWER_PICKUP: 20, CREDIT_PICKUP: 5 },
    hard: { POWER_PICKUP: 10, CREDIT_PICKUP: 3 },
  },
  // Stub all other config exports to avoid import errors in other modules
  CONTROLS: { DEFAULT_MODE: 'default', MODES: { default: {} } },
  CAMERA: { DEFAULT_SCALE: 2.0 },
  LIGHTING: { PLAYER_AMBIENT: { RADIUS: 40, BRIGHTNESS: 0.3 } },
  TORCH: { RADIUS: 120 },
  SONAR: { COOLDOWN_MS: 500 },
  PLAYER: { DRAG: 0.85, ACCELERATION: 0.8, MOVE_SPEED: 200 },
}));

// Mock hitboxSystem
jest.unstable_mockModule('../systems/hitboxSystem.js', () => ({
  isColliding: jest.fn(),
  Hitbox: class {},
  Wall: class {},
}));

const hitboxModule = await import('../systems/hitboxSystem.js');
const mockIsColliding = hitboxModule.isColliding;
mockIsColliding.mockReset().mockReturnValue(false);

const { createResourceManagementSystem } = await import('../systems/resourceManagementSystem.js');

describe('ResourceManagementSystem', () => {
  beforeEach(() => {
    mockIsColliding.mockReset().mockReturnValue(false);
  });

  function makePlayer(overrides = {}) {
    return {
      position: { x: 100, y: 100 },
      x: 100,
      y: 100,
      w: 32,
      h: 16,
      power: {
        current: 100,
        maxPower: 100,
        drain: jest.fn(),
      },
      credits: 0,
      isOnHazard: false,
      ...overrides,
    };
  }

  function makeCollectable(overrides = {}) {
    return { x: 105, y: 105, w: 16, h: 16, collectableType: 'power', ...overrides };
  }

  function makeHazard(overrides = {}) {
    return { x: 105, y: 105, w: 16, h: 16, ...overrides };
  }

  function makeEnemy(overrides = {}) {
    return {
      position: { x: 105, y: 105 },
      x: 105, y: 105,
      w: 24, h: 24,
      ...overrides,
    };
  }

  //======================================
  // POWER PICKUP
  //======================================

  describe('power collectable pickup', () => {
    it('increases player.power.current on power collectable pickup', () => {
      const player = makePlayer({ power: { current: 50, maxPower: 100, drain: jest.fn() } });
      const collectable = makeCollectable({ collectableType: 'power' });
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [collectable], () => [], () => 'easy', () => []
      );
      mockIsColliding.mockReturnValue(true);
      rms.update();
      expect(player.power.current).toBeGreaterThan(50);
    });

    it('caps power at maxPower after pickup', () => {
      const player = makePlayer({ power: { current: 95, maxPower: 100, drain: jest.fn() } });
      const collectable = makeCollectable({ collectableType: 'power' });
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [collectable], () => [], () => 'easy', () => []
      );
      mockIsColliding.mockReturnValue(true);
      rms.update();
      expect(player.power.current).toBeLessThanOrEqual(100);
    });

    it('does not double-collect the same item', () => {
      const player = makePlayer({ power: { current: 50, maxPower: 100, drain: jest.fn() } });
      const collectable = makeCollectable({ collectableType: 'power' });
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [collectable], () => [], () => 'easy', () => []
      );
      mockIsColliding.mockReturnValue(true);
      rms.update();
      const afterFirst = player.power.current;
      rms.update();
      expect(player.power.current).toBe(afterFirst);
    });
  });

  //======================================
  // CREDIT PICKUP
  //======================================

  describe('credit collectable pickup', () => {
    it('increments player.credits on credit collectable pickup', () => {
      const player = makePlayer({ credits: 10 });
      const collectable = makeCollectable({ collectableType: 'credits' });
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [collectable], () => [], () => 'easy', () => []
      );
      mockIsColliding.mockReturnValue(true);
      rms.update();
      expect(player.credits).toBeGreaterThan(10);
    });

    it('easy gives more credits than hard', () => {
      const easyPlayer = makePlayer({ credits: 0 });
      const hardPlayer = makePlayer({ credits: 0 });
      const collectable = makeCollectable({ collectableType: 'credits' });

      const easyRMS = createResourceManagementSystem(
        easyPlayer, () => ({}), () => [collectable], () => [], () => 'easy', () => []
      );
      mockIsColliding.mockReturnValue(true);
      easyRMS.update();

      const hardRMS = createResourceManagementSystem(
        hardPlayer, () => ({}), () => [collectable], () => [], () => 'hard', () => []
      );
      mockIsColliding.mockReturnValue(true);
      hardRMS.update();

      expect(easyPlayer.credits).toBeGreaterThan(hardPlayer.credits);
    });
  });

  //======================================
  // HAZARD DRAIN
  //======================================

  describe('hazard overlap and drain', () => {
    it('calls power.drain when player overlaps hazard', () => {
      const player = makePlayer({ power: { current: 100, maxPower: 100, drain: jest.fn() } });
      const hazard = makeHazard();
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [], () => [hazard], () => 'easy', () => []
      );
      mockIsColliding.mockReturnValue(true);
      rms.update();
      expect(player.power.drain).toHaveBeenCalled();
    });

    it('sets isOnHazard = true when overlapping hazard', () => {
      const player = makePlayer({ power: { current: 100, maxPower: 100, drain: jest.fn() } });
      const hazard = makeHazard();
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [], () => [hazard], () => 'easy', () => []
      );
      mockIsColliding.mockReturnValue(true);
      rms.update();
      expect(player.isOnHazard).toBe(true);
    });

    it('sets isOnHazard = false when not on hazard', () => {
      const player = makePlayer({ isOnHazard: true });
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [], () => [], () => 'easy', () => []
      );
      mockIsColliding.mockReturnValue(false);
      rms.update();
      expect(player.isOnHazard).toBe(false);
    });

    it('applies entry penalty on first contact', () => {
      const player = makePlayer({ power: { current: 100, maxPower: 100, drain: jest.fn() } });
      const hazard = makeHazard();
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [], () => [hazard], () => 'easy', () => []
      );
      mockIsColliding.mockReturnValue(true);
      rms.update();
      expect(player.power.current).toBeLessThan(100);
    });
  });

  //======================================
  // ENEMY CONTACT
  //======================================

  describe('enemy contact', () => {
    it('handles enemy contact without throwing', () => {
      const player = makePlayer({ power: { current: 100, maxPower: 100, drain: jest.fn() } });
      const enemy = makeEnemy();
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [], () => [], () => 'easy', () => [enemy]
      );
      mockIsColliding.mockReturnValue(true);
      expect(() => rms.update()).not.toThrow();
    });

    it('handles empty enemy list', () => {
      const player = makePlayer();
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [], () => [], () => 'easy', () => []
      );
      expect(() => rms.update()).not.toThrow();
    });
  });

  //======================================
  // RESET
  //======================================

  describe('reset', () => {
    it('allows re-collection of items after reset', () => {
      const player = makePlayer({ power: { current: 50, maxPower: 100, drain: jest.fn() } });
      const collectable = makeCollectable({ collectableType: 'power' });
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [collectable], () => [], () => 'easy', () => []
      );
      mockIsColliding.mockReturnValue(true);
      rms.update();
      const afterFirst = player.power.current;
      rms.reset();
      mockIsColliding.mockReturnValue(true);
      rms.update();
      expect(player.power.current).toBe(afterFirst + 20);
    });
  });

  //======================================
  // HELPER METHODS
  //======================================

  describe('helper methods', () => {
    it('isCollected returns true for collected entity', () => {
      const player = makePlayer();
      const collectable = makeCollectable({ collectableType: 'power' });
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [collectable], () => [], () => 'easy', () => []
      );
      mockIsColliding.mockReturnValue(true);
      rms.update();
      expect(rms.isCollected(collectable)).toBe(true);
    });

    it('collectEntity manually marks entity as collected', () => {
      const player = makePlayer();
      const collectable = makeCollectable();
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [collectable], () => [], () => 'easy', () => []
      );
      rms.collectEntity(collectable);
      expect(rms.isCollected(collectable)).toBe(true);
    });

    it('getUncollectedEntities filters by resourceType', () => {
      const player = makePlayer();
      const powerItem = makeCollectable({ collectableType: 'power' });
      const creditItem = makeCollectable({ collectableType: 'credits', x: 200 });
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [powerItem, creditItem], () => [], () => 'easy', () => []
      );
      rms.collectEntity(powerItem);
      const uncollected = rms.getUncollectedEntities('credits');
      expect(uncollected.length).toBe(1);
      expect(uncollected[0]).toBe(creditItem);
    });
  });

  //======================================
  // EDGE CASES
  //======================================

  describe('edge cases', () => {
    it('handles empty collectables array', () => {
      const player = makePlayer();
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [], () => [], () => 'easy', () => []
      );
      expect(() => rms.update()).not.toThrow();
    });

    it('handles null/undefined difficulty getter', () => {
      const player = makePlayer();
      const rms = createResourceManagementSystem(
        player, () => ({}), () => [], () => [], () => null, () => []
      );
      expect(() => rms.update()).not.toThrow();
    });
  });
});
