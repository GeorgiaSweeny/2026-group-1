import { createMissileSystem } from "../systems/missileSystem.js";
import { GAME } from "../config.js";
import { isColliding } from "../systems/hitboxSystem.js";


jest.mock("../config.js", () => ({
  MISSILE: { SPEED: 5, TURN_SPEED: 2, LIFETIME: 1000, SIZE: 10, COOLDOWN: 500 },
  GAME: { DIFFICULTY: 'NORMAL' },
  TIME: { fixedDeltaTime: 0.016 },
}));

jest.mock("../systems/hitboxSystem.js", () => ({
  Hitbox: class {
    constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; }
  },
  isColliding: jest.fn(),
}));

describe("MissileSystem", () => {
  let mockPlayer;
  let mockTargets;
  let mockWalls;
  let mockSoundSystem;

  beforeEach(() => {
    jest.clearAllMocks();

    global.random = jest.fn(() => 0.5);
    global.cos = Math.cos;
    global.sin = Math.sin;
    global.createVector = (x, y) => ({
      x, y,
      add: function(v) { this.x += v.x; this.y += v.y; return this; },
      copy: function() { return global.createVector(this.x, this.y); },
      normalize: function() { return this; }, 
      heading: () => 0,
      mult: function(n) { this.x *= n; this.y *= n; return this; },
      set: function(v) { this.x = v.x; this.y = v.y; return this; }
    });
    global.p5 = {
      Vector: {
        dist: (v1, v2) => Math.hypot(v2.x - v1.x, v2.y - v1.y),
        sub: (v1, v2) => global.createVector(v1.x - v2.x, v1.y - v2.y),
        lerp: (v1, v2, amt) => global.createVector(v1.x, v1.y), 
        mult: (v, n) => global.createVector(v.x * n, v.y * n)
      }
    };

    jest.spyOn(performance, 'now').mockReturnValue(1000);

    mockPlayer = {
      position: { x: 0, y: 0 },
      facing: 1,
      missiles: 3,
      actionIntent: { launchMissile: false },
    };

    mockTargets = [];
    mockWalls = [];
    mockSoundSystem = { play: jest.fn() };
   
    GAME.DIFFICULTY = 'NORMAL';
  });

  it("should launch a missile, decrement ammo, and play sound when intent is true", () => {
    mockPlayer.actionIntent.launchMissile = true;
    const missileSystem = createMissileSystem(mockPlayer, () => mockTargets, () => mockWalls, mockSoundSystem);

    missileSystem.update();

    expect(missileSystem.getMissiles().length).toBe(1);
    expect(mockPlayer.missiles).toBe(2);
    expect(mockPlayer.actionIntent.launchMissile).toBe(false);
    expect(mockSoundSystem.play).toHaveBeenCalledWith('missileFired', 0.2);
  });

  it("should not launch a missile if out of ammo", () => {
    mockPlayer.missiles = 0;
    mockPlayer.actionIntent.launchMissile = true;
    const missileSystem = createMissileSystem(mockPlayer, () => [], () => []);

    missileSystem.update();

    expect(missileSystem.getMissiles().length).toBe(0);
  });

  it("should not launch a missile if intent is false", () => {
    mockPlayer.actionIntent.launchMissile = false;
    const missileSystem = createMissileSystem(mockPlayer, () => [], () => []);

    missileSystem.update();

    expect(missileSystem.getMissiles().length).toBe(0);
  });

  it("should respect the fire cooldown timer", () => {
    const missileSystem = createMissileSystem(mockPlayer, () => [], () => []);
    
    mockPlayer.actionIntent.launchMissile = true;
    missileSystem.update();
    expect(missileSystem.getMissiles().length).toBe(1);

    jest.spyOn(performance, 'now').mockReturnValue(1100);
    mockPlayer.actionIntent.launchMissile = true;
    missileSystem.update();

    expect(missileSystem.getMissiles().length).toBe(1);
  });

  it("should allow firing again once the cooldown has expired", () => {
    const missileSystem = createMissileSystem(mockPlayer, () => [], () => []);
    
    mockPlayer.actionIntent.launchMissile = true;
    missileSystem.update();
    expect(missileSystem.getMissiles().length).toBe(1);

    jest.spyOn(performance, 'now').mockReturnValue(1600);
    mockPlayer.actionIntent.launchMissile = true;
    missileSystem.update();

    expect(missileSystem.getMissiles().length).toBe(2);
  });

  it("should target the nearest valid enemy in front of the player", () => {
    const enemyBehind = { position: { x: -50, y: 0 }, pendingDestroy: false };
    const enemyClose = { position: { x: 50, y: 0 }, pendingDestroy: false };
    const enemyFar = { position: { x: 150, y: 0 }, pendingDestroy: false };
    
    mockTargets = [enemyBehind, enemyFar, enemyClose];
    mockPlayer.actionIntent.launchMissile = true;
    
    const missileSystem = createMissileSystem(mockPlayer, () => mockTargets, () => []);

    missileSystem.update();

    const activeMissiles = missileSystem.getMissiles();
    expect(activeMissiles.length).toBe(1);
    expect(activeMissiles[0].target).toBe(enemyClose);
  });

  it("should destroy enemies on collision and destroy the missile", () => {
    const enemy = { position: { x: 100, y: 0 }, pendingDestroy: false };
    mockTargets = [enemy];
    mockPlayer.actionIntent.launchMissile = true;
    const missileSystem = createMissileSystem(mockPlayer, () => mockTargets, () => []);

    isColliding.mockReturnValue(true);

    missileSystem.update();
    missileSystem.update();

    expect(enemy.pendingDestroy).toBe(true);
    expect(missileSystem.getMissiles().length).toBe(0);
  });

  it("should destroy adjacent breakable walls when difficulty is EASY", () => {
    GAME.DIFFICULTY = 'EASY';
    
    const targetWall = { position: { x: 100, y: 0 }, isBreakable: true, isDestroyed: false };
    const nearbyWall = { position: { x: 110, y: 0 }, isBreakable: true, isDestroyed: false };
    const farWall = { position: { x: 300, y: 0 }, isBreakable: true, isDestroyed: false };
    
    mockWalls = [targetWall, nearbyWall, farWall];
    mockPlayer.actionIntent.launchMissile = true;
    
    const missileSystem = createMissileSystem(mockPlayer, () => [], () => mockWalls);
    
    isColliding.mockReturnValue(true);

    missileSystem.update();
    missileSystem.update();

    expect(targetWall.isDestroyed).toBe(true);
    expect(nearbyWall.isDestroyed).toBe(true);
    expect(farWall.isDestroyed).toBe(false);
  });

  it("should only destroy the target breakable wall when difficulty is NORMAL", () => {
    GAME.DIFFICULTY = 'NORMAL';
    
    const targetWall = { position: { x: 100, y: 0 }, isBreakable: true, isDestroyed: false };
    const nearbyWall = { position: { x: 110, y: 0 }, isBreakable: true, isDestroyed: false };
    
    mockWalls = [targetWall, nearbyWall];
    mockPlayer.actionIntent.launchMissile = true;
    
    const missileSystem = createMissileSystem(mockPlayer, () => [], () => mockWalls);
    
    isColliding.mockReturnValue(true);

    missileSystem.update();
    missileSystem.update();

    expect(targetWall.isDestroyed).toBe(true);
    expect(nearbyWall.isDestroyed).toBe(false);
  });

  it("should destroy missiles after their lifetime expires", () => {
    mockPlayer.actionIntent.launchMissile = true;
    const missileSystem = createMissileSystem(mockPlayer, () => [], () => []);

    missileSystem.update();
    expect(missileSystem.getMissiles().length).toBe(1);

    jest.spyOn(performance, 'now').mockReturnValue(2100);
    
    missileSystem.update();

    expect(missileSystem.getMissiles().length).toBe(0);
  });

  describe("Targeting Functionality (getCurrentTarget)", () => {
    it("should return null if no targets are present or available", () => {
      const missileSystem = createMissileSystem(mockPlayer, () => [], () => []);
      missileSystem.update();
      expect(missileSystem.getCurrentTarget()).toBeNull();
    });

    it("should constantly track and return the nearest target on update", () => {
      const farEnemy = { position: { x: 300, y: 0 }, pendingDestroy: false };
      const closeEnemy = { position: { x: 200, y: 0 }, pendingDestroy: false };
      
      mockTargets = [farEnemy, closeEnemy];
      
      const missileSystem = createMissileSystem(mockPlayer, () => mockTargets, () => []);
      missileSystem.update();

      expect(missileSystem.getCurrentTarget()).toBe(closeEnemy);
    });

    it("should dynamically switch targets when a closer target emerges", () => {
      const enemy1 = { position: { x: 250, y: 0 }, pendingDestroy: false };
      mockTargets = [enemy1];
      
      const missileSystem = createMissileSystem(mockPlayer, () => mockTargets, () => []);
      missileSystem.update();
      expect(missileSystem.getCurrentTarget()).toBe(enemy1);

      const enemy2 = { position: { x: 100, y: 0 }, pendingDestroy: false };
      mockTargets.push(enemy2);
      
      missileSystem.update(); 
      expect(missileSystem.getCurrentTarget()).toBe(enemy2);
    });

    it("should ignore targets out of range (> 400) or behind the player", () => {
      const enemyTooFar = { position: { x: 450, y: 0 }, pendingDestroy: false };
      const enemyBehind = { position: { x: -100, y: 0 }, pendingDestroy: false };
      
      mockTargets = [enemyTooFar, enemyBehind];
      
      const missileSystem = createMissileSystem(mockPlayer, () => mockTargets, () => []);
      missileSystem.update();

      expect(missileSystem.getCurrentTarget()).toBeNull();
    });

    it("should prioritise targeting breakable walls if they are closest", () => {
      const enemy = { position: { x: 300, y: 0 }, pendingDestroy: false };
      const breakableWall = { position: { x: 150, y: 0 }, isBreakable: true, isDestroyed: false };
      const unbreakableWall = { position: { x: 100, y: 0 }, isBreakable: false, isDestroyed: false };
      
      mockTargets = [enemy];
      mockWalls = [breakableWall, unbreakableWall];
      
      const missileSystem = createMissileSystem(mockPlayer, () => mockTargets, () => mockWalls);
      missileSystem.update();

      expect(missileSystem.getCurrentTarget()).toBe(breakableWall);
    });
  });
});
