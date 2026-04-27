import { createMinimapDepsFixture } from "./helpers/minimapFixtures.js";
import { createMiniMapSystem } from "../systems/miniMapSystem.js";

// DISABLED: written for the old rectangular p5.js minimap implementation.
// The minimap system has been replaced with the circular Canvas 2D version from minimap-feature.
describe.skip("miniMapSystem contract", () => {
  it("returns the required interface shape", () => {
    const deps = createMinimapDepsFixture();

    const system = createMiniMapSystem(deps);

    expect(typeof system.update).toBe("function");
    expect(typeof system.draw).toBe("function");
    expect(typeof system.onRoomChanged).toBe("function");
    expect(typeof system.getExplorationState).toBe("function");
    expect(typeof system.restoreExplorationState).toBe("function");
  });
});
