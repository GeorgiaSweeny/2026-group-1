/*
========================================
TESTS: powerSystem.js
AUTHOR: Georgia Sweeny
========================================
*/

import { jest } from '@jest/globals';
import { PowerSystem } from '../entities/components/power.js';
import { createPowerSystem } from '../systems/powerSystem.js';
import { POWER, TORCH } from '../config.js';

//======================================
// HELPERS
//======================================

function makePower(overrides = {}) {
   return new PowerSystem({ ...POWER, ...overrides });
}

function makeSystem(entityOverrides = {}, configOverrides = {}) {
   const entity = { ...entityOverrides };
   const system = createPowerSystem(entity, { ...POWER, ...configOverrides });
   return { entity, system };
}

//======================================
// SYSTEM CREATION
//======================================

describe('createPowerSystem — system creation', () => {
   it('uses existing entity.power if present', () => {
      const existing = makePower();
      const entity = { power: existing };
      const system = createPowerSystem(entity);
      expect(system.power).toBe(existing);
   });

   it('creates a new PowerSystem if entity has no power', () => {
      const entity = {};
      createPowerSystem(entity);
      expect(entity.power).toBeInstanceOf(PowerSystem);
   });

   it('assigns the new instance to entity.power', () => {
      const entity = {};
      const system = createPowerSystem(entity);
      expect(entity.power).toBe(system.power);
   });
});

//======================================
// update()
//======================================

describe('createPowerSystem — update()', () => {
   it('calls power.drain() once per update', () => {
      const { entity, system } = makeSystem();
      const spy = jest.spyOn(entity.power, 'drain');
      system.update();
      expect(spy).toHaveBeenCalledTimes(1);
   });

   it('uses base drain rate when no torch exists on entity', () => {
      const { entity, system } = makeSystem();
      const spy = jest.spyOn(entity.power, 'drain');
      system.update();
      expect(spy).toHaveBeenCalledWith(entity.power.drainRate);
   });

   it('uses base drain rate when torch exists but is off', () => {
      const { entity, system } = makeSystem({ torch: { isOn: false } });
      const spy = jest.spyOn(entity.power, 'drain');
      system.update();
      expect(spy).toHaveBeenCalledWith(entity.power.drainRate);
   });

   it('multiplies drain rate by TORCH.DRAIN_RATE when torch is on', () => {
      const { entity, system } = makeSystem({ torch: { isOn: true } });
      const spy = jest.spyOn(entity.power, 'drain');
      system.update();
      expect(spy).toHaveBeenCalledWith(entity.power.drainRate * TORCH.DRAIN_RATE);
   });

   it('drain rate does not stack across frames — resets to drainRate each update', () => {
      const { entity, system } = makeSystem({ torch: { isOn: true } });
      const spy = jest.spyOn(entity.power, 'drain');

      system.update();
      system.update();
      system.update();

      const expectedRate = entity.power.drainRate * TORCH.DRAIN_RATE;
      spy.mock.calls.forEach(([rate]) => {
         expect(rate).toBeCloseTo(expectedRate);
      });
   });
});

//======================================
// NO POWER = entity.torch.isOn == false
//======================================

describe('createPowerSystem — no power = no torch', () => {
   it('sets torch.isOn = false when power is empty', () => {
      const { entity, system } = makeSystem(
         { torch: { isOn: true } },
         { CURRENT_POWER: 0, MAX_POWER: 100 }
      );
      system.update();
      expect(entity.torch.isOn).toBe(false);
   });

   it('forces torch off the exact frame power.current reaches zero', () => {
      const { entity, system } = makeSystem(
         { torch: { isOn: true } },
         { CURRENT_POWER: 100, MAX_POWER: 100 }
      );
      entity.power.current = 0;
      system.update();
      expect(entity.torch.isOn).toBe(false);
   });

   it('does not turn off torch when power is not empty', () => {
      const { entity, system } = makeSystem(
         { torch: { isOn: true } },
         { CURRENT_POWER: 100, MAX_POWER: 100 }
      );
      system.update();
      expect(entity.torch.isOn).toBe(true);
   });

   it('does not throw if no torch exists on entity', () => {
      const { system } = makeSystem({}, { CURRENT_POWER: 0, MAX_POWER: 100 });
      expect(() => system.update()).not.toThrow();
   });
});
