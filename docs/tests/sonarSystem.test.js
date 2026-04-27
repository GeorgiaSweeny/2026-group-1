import { createSonarSystem } from "../systems/sonarSystem.js";

jest.mock("../config.js", () => ({
  SONAR: { COOLDOWN_MS: 100 },
}));

describe("SonarSystem", () => {
  let mockPlayer;
  let mockWalls;
  let mockSoundSystem;

  beforeEach(() => {
    global.TWO_PI = Math.PI * 2;
    global.createVector = jest.fn((x, y) => ({ x, y }));
    global.p5 = {
      Vector: {
        fromAngle: jest.fn(() => ({
          mult: jest.fn((speed) => ({ x: speed, y: speed })),
        })),
      },
    };

    mockPlayer = {
      x: 50,
      y: 50,
      actionIntent: { emitSonar: false },
    };

    mockWalls = [
      { x: 100, y: 100, w: 20, h: 20, isDestroyed: false }
    ];

    mockSoundSystem = {
      play: jest.fn(),
    };
  });

  it("should not emit a pulse on update if player intent is false", () => {
    const getWalls = () => mockWalls;
    const sonarSystem = createSonarSystem(mockPlayer, getWalls);

    sonarSystem.update();

    expect(sonarSystem.getActivePulses().length).toBe(0);
    expect(sonarSystem.getCooldownPercent()).toBe(0);
  });

  it("should emit a pulse, play sound, and start cooldown when player intent is true", () => {
    mockPlayer.actionIntent.emitSonar = true;
    const sonarSystem = createSonarSystem(mockPlayer, () => mockWalls, () => [], () => [], mockSoundSystem);

    sonarSystem.update();

    expect(sonarSystem.getActivePulses().length).toBe(1);
    expect(mockPlayer.actionIntent.emitSonar).toBe(false);
    expect(mockSoundSystem.play).toHaveBeenCalledWith("sonarPing", 0.8);
    expect(sonarSystem.getCooldownPercent()).toBeGreaterThan(0);
  });

  it("should ignore sonar intent if the cooldown is still active", () => {
    const sonarSystem = createSonarSystem(mockPlayer, () => mockWalls);
  
    mockPlayer.actionIntent.emitSonar = true;
    sonarSystem.update();
    expect(sonarSystem.getActivePulses().length).toBe(1);

    mockPlayer.actionIntent.emitSonar = true;
    sonarSystem.update();

    expect(sonarSystem.getActivePulses().length).toBe(1);
  });

  it("should normalise wall data and filter out destroyed blocks", () => {
    const destroyedWall = { x: 200, y: 200, w: 20, h: 20, isDestroyed: true };
    const getWalls = () => [...mockWalls, destroyedWall];
    const sonarSystem = createSonarSystem(mockPlayer, getWalls);

    mockPlayer.x = 100;
    mockPlayer.y = 100;
    mockPlayer.actionIntent.emitSonar = true;
    
    sonarSystem.update();
    sonarSystem.update(); 

    const revealedWalls = sonarSystem.getRevealedWalls();
    expect(revealedWalls.length).toBe(1);
    expect(revealedWalls[0].x).toBe(90);
  });

  it("should fade revealed walls over time via update()", () => {
    mockPlayer.x = 100;
    mockPlayer.y = 100;
    mockPlayer.actionIntent.emitSonar = true;
    const sonarSystem = createSonarSystem(mockPlayer, () => mockWalls);

    sonarSystem.update();
    sonarSystem.update();

    const initialReveals = sonarSystem.getRevealedWalls();
    const initialAlpha = initialReveals[0].alpha;

    sonarSystem.update(); 
    
    const laterReveals = sonarSystem.getRevealedWalls();
    const laterAlpha = laterReveals[0].alpha;

    expect(laterAlpha).toBeLessThan(initialAlpha);
  });

  it("should reveal hazards and collectables when a pulse collides with them", () => {
    const mockHazards = [{ x: 100, y: 100, w: 20, h: 20 }];
    const mockCollectables = [{ x: 100, y: 100, w: 20, h: 20, gid: 5, collectableType: "gold" }];
    
    mockPlayer.actionIntent.emitSonar = true;
    const sonarSystem = createSonarSystem(
      mockPlayer, 
      () => [], 
      () => mockHazards, 
      () => mockCollectables
    );

    sonarSystem.update();
    sonarSystem.update();

    const revealedHazards = sonarSystem.getRevealedHazards();
    const revealedCollectables = sonarSystem.getRevealedCollectables();
    
    expect(revealedHazards.length).toBe(1);
    expect(revealedCollectables.length).toBe(1);
    
    expect(revealedCollectables[0].gid).toBe(5);
    expect(revealedCollectables[0].collectableType).toBe("gold");
  });

  it("should reveal enemies when a pulse collides with them", () => {
    const mockEnemies = [{ x: 100, y: 100, w: 20, h: 20 }];
    
    mockPlayer.actionIntent.emitSonar = true;
    const sonarSystem = createSonarSystem(
      mockPlayer, 
      () => [], 
      () => [], 
      () => [],
      mockSoundSystem,
      () => mockEnemies
    );

    sonarSystem.update();
    sonarSystem.update();

    const revealedEnemies = sonarSystem.getRevealedEnemies();
    
    expect(revealedEnemies.length).toBe(1);
    expect(revealedEnemies[0].x).toBe(90);
    expect(revealedEnemies[0].y).toBe(90);
    expect(revealedEnemies[0].alpha).toBeGreaterThan(0);
  });

  it("should remove pulses once they have finished their lifecycle", () => {
    mockPlayer.actionIntent.emitSonar = true;
    const sonarSystem = createSonarSystem(mockPlayer, () => [], () => [], () => []);
    
    sonarSystem.update();
    expect(sonarSystem.getActivePulses().length).toBe(1);

    const pulse = sonarSystem.getActivePulses()[0];
    pulse.particles.forEach(p => p.life = 0);
    
    sonarSystem.update();

    expect(sonarSystem.getActivePulses().length).toBe(0);
  });

  it("should fully delete walls from the alpha WeakMap when alpha <= 0", () => {
    mockPlayer.actionIntent.emitSonar = true;
    const sonarSystem = createSonarSystem(mockPlayer, () => mockWalls);

    sonarSystem.update();
    sonarSystem.update();

    for (let i = 0; i < 40; i++) {
      sonarSystem.update();
    }

    const reveals = sonarSystem.getRevealedWalls();
    expect(reveals.length).toBe(0);
  });
});
