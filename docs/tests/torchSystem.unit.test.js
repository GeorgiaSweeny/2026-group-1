/*
========================================
TESTS: torchSystem.js
AUTHOR: Georgia Sweeny
========================================
*/

import { jest } from '@jest/globals';
import { createTorchSystem } from '../systems/torchSystem.js';

//======================================
// HELPERS
//======================================

function makeTorch(overrides = {}) {
   return {
      isOn: false,
      update: jest.fn(),
      tryToggle: jest.fn(),
      setUpgradeLevel: jest.fn(),
      ...overrides
   };
}

function makePower(isEmpty = false) {
   return { isEmpty: jest.fn().mockReturnValue(isEmpty) };
}

function makePlayer(overrides = {}) {
   return {
      actionIntent: { toggleTorch: false },
      power: makePower(),
      upgrades: { torch: 1 },
      ...overrides
   };
}

function makeSoundSystem() {
   return { play: jest.fn() };
}

//======================================
// UPDATE
//======================================

describe('TorchSystem — update', () => {
   it('calls torch.update() once per update() call', () => {
      const torch = makeTorch();
      const player = makePlayer();
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.update).toHaveBeenCalledTimes(1);
   });

   it('does not throw if player.actionIntent is undefined', () => {
      const torch = makeTorch();
      const player = makePlayer({ actionIntent: undefined });
      const system = createTorchSystem(torch, player);
      expect(() => system.update()).not.toThrow();
   });
});

//======================================
// TOGGLE HANDLING
//======================================

describe('TorchSystem — toggle handling', () => {
   it('calls torch.tryToggle(true) when toggleTorch = true and power is not empty', () => {
      const torch = makeTorch();
      const player = makePlayer({
         actionIntent: { toggleTorch: true },
         power: makePower(false)
      });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.tryToggle).toHaveBeenCalledWith(true);
   });

   it('calls torch.tryToggle(false) when toggleTorch = true and power is empty', () => {
      const torch = makeTorch();
      const player = makePlayer({
         actionIntent: { toggleTorch: true },
         power: makePower(true)
      });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.tryToggle).toHaveBeenCalledWith(false);
   });

   it('does not call torch.tryToggle when toggleTorch is false', () => {
      const torch = makeTorch();
      const player = makePlayer({ actionIntent: { toggleTorch: false } });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.tryToggle).not.toHaveBeenCalled();
   });

   it('resets player.actionIntent.toggleTorch to false after handling', () => {
      const torch = makeTorch();
      const player = makePlayer({ actionIntent: { toggleTorch: true } });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(player.actionIntent.toggleTorch).toBe(false);
   });

   it('does not retrigger toggle on subsequent updates without new input', () => {
      const torch = makeTorch();
      const player = makePlayer({ actionIntent: { toggleTorch: true } });
      const system = createTorchSystem(torch, player);
      system.update();
      system.update();
      expect(torch.tryToggle).toHaveBeenCalledTimes(1);
   });
});

//======================================
// SOUND
//======================================

describe('TorchSystem — sound', () => {
   it("calls soundSystem.play('torchToggle', 0.8) when toggle occurs", () => {
      const torch = makeTorch();
      const player = makePlayer({ actionIntent: { toggleTorch: true } });
      const soundSystem = makeSoundSystem();
      const system = createTorchSystem(torch, player, { soundSystem });
      system.update();
      expect(soundSystem.play).toHaveBeenCalledWith('torchToggle', 0.8);
   });

   it('does not throw if soundSystem is null', () => {
      const torch = makeTorch();
      const player = makePlayer({ actionIntent: { toggleTorch: true } });
      const system = createTorchSystem(torch, player, { soundSystem: null });
      expect(() => system.update()).not.toThrow();
   });
});

//======================================
// POWER LOGIC
//======================================

describe('TorchSystem — power logic', () => {
   it('sets torch.isOn = false when torch is ON and power.isEmpty() is true', () => {
      const torch = makeTorch({ isOn: true });
      const player = makePlayer({ power: makePower(true) });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.isOn).toBe(false);
   });

   it('does not change torch.isOn when power is not empty', () => {
      const torch = makeTorch({ isOn: true });
      const player = makePlayer({ power: makePower(false) });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.isOn).toBe(true);
   });

   it('prevents torch turning ON by passing false into tryToggle when power is empty', () => {
      const torch = makeTorch();
      const player = makePlayer({
         actionIntent: { toggleTorch: true },
         power: makePower(true)
      });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.tryToggle).toHaveBeenCalledWith(false);
   });
});

//======================================
// UPGRADE LOGIC
//======================================

describe('TorchSystem — upgrade logic', () => {
   it('calls torch.setUpgradeLevel(player.upgrades.torch) when torch is ON', () => {
      const torch = makeTorch({ isOn: true });
      const player = makePlayer({
         power: makePower(false),
         upgrades: { torch: 2 }
      });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.setUpgradeLevel).toHaveBeenCalledWith(2);
   });

   it('calls torch.setUpgradeLevel(1) when upgrades are missing', () => {
      const torch = makeTorch({ isOn: true });
      const player = makePlayer({
         power: makePower(false),
         upgrades: undefined
      });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.setUpgradeLevel).toHaveBeenCalledWith(1);
   });

   it('does not call setUpgradeLevel when torch is OFF', () => {
      const torch = makeTorch({ isOn: false });
      const player = makePlayer({ power: makePower(false) });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.setUpgradeLevel).not.toHaveBeenCalled();
   });
});

//======================================
// STABILITY
//======================================

describe('TorchSystem — stability', () => {
   it('does not call soundSystem.play repeatedly across frames without new input', () => {
      const torch = makeTorch();
      const player = makePlayer({ actionIntent: { toggleTorch: true } });
      const soundSystem = makeSoundSystem();
      const system = createTorchSystem(torch, player, { soundSystem });
      system.update();
      system.update();
      system.update();
      expect(soundSystem.play).toHaveBeenCalledTimes(1);
   });

   it('does not change state across frames when inputs remain unchanged', () => {
      const torch = makeTorch({ isOn: false });
      const player = makePlayer({
         actionIntent: { toggleTorch: false },
         power: makePower(false)
      });
      const system = createTorchSystem(torch, player);
      system.update();
      system.update();
      system.update();
      expect(torch.isOn).toBe(false);
      expect(torch.tryToggle).not.toHaveBeenCalled();
      expect(torch.setUpgradeLevel).not.toHaveBeenCalled();
   });
});

//======================================
// EDGE CASES
//======================================

describe('TorchSystem — edge cases', () => {
   it('handles missing soundSystem', () => {
      const torch = makeTorch();
      const player = makePlayer({ actionIntent: { toggleTorch: true } });
      const system = createTorchSystem(torch, player);
      expect(() => system.update()).not.toThrow();
   });

   it('turns OFF torch if it starts ON and power.isEmpty() is true', () => {
      const torch = makeTorch({ isOn: true });
      const player = makePlayer({ power: makePower(true) });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.isOn).toBe(false);
   });
});

//======================================
// ORDER OF OPERATIONS
//======================================

describe('TorchSystem — order of operations', () => {
   it('processes toggle before power shutoff in same update', () => {
      // Torch starts ON. Toggle intent fires with empty power.
      // tryToggle(false) is dispatched first (toggle processed, intent consumed),
      // then the power shutoff check runs and sets isOn = false.
      const torch = makeTorch({ isOn: true });
      const player = makePlayer({
         actionIntent: { toggleTorch: true },
         power: makePower(true)
      });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.tryToggle).toHaveBeenCalledWith(false);
      expect(player.actionIntent.toggleTorch).toBe(false);
      expect(torch.isOn).toBe(false);
   });

   it('ensures torch cannot remain ON if power.isEmpty() is true after update', () => {
      const torch = makeTorch({ isOn: true });
      const player = makePlayer({
         actionIntent: { toggleTorch: false },
         power: makePower(true)
      });
      const system = createTorchSystem(torch, player);
      system.update();
      expect(torch.isOn).toBe(false);
   });
});

//======================================
// POWER BOUNDARY — torch only fails at power = 0
// isEmpty() is the sole gate. The torch is fully usable on every frame
// before it returns true, and fails on the exact frame it does.
//======================================

describe('TorchSystem — power boundary', () => {
   it('torch is toggleable on the frame before power empties, then fails on the next', () => {
      const torch = makeTorch();
      const power = makePower(false);
      const player = makePlayer({ actionIntent: { toggleTorch: true }, power });
      const system = createTorchSystem(torch, player);

      // Frame 1: power not yet empty — toggle goes through
      system.update();
      expect(torch.tryToggle).toHaveBeenCalledWith(true);

      // Frame 2: power now empty — toggle is blocked
      power.isEmpty.mockReturnValue(true);
      player.actionIntent.toggleTorch = true;
      torch.tryToggle.mockClear();
      system.update();
      expect(torch.tryToggle).toHaveBeenCalledWith(false);
   });

   it('torch stays ON across frames until the exact frame isEmpty returns true', () => {
      const torch = makeTorch({ isOn: true });
      const power = makePower(false);
      const player = makePlayer({ power });
      const system = createTorchSystem(torch, player);

      system.update();
      system.update();
      expect(torch.isOn).toBe(true);

      power.isEmpty.mockReturnValue(true);
      system.update();
      expect(torch.isOn).toBe(false);
   });
});
