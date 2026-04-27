/*
========================================
VERSION: 2.4
COMPONENT: POWER
AUTHOR: Georgia Sweeny
DESCRIPTION:
- Tracks the player's energy resource (power)
- Frame-rate independent draining and utility checks
- Exposes percentage-based values for UI and other systems

RULES:
- No rendering logic inside this component
- No knowledge of other systems or entities
- Power depletion must be consistent across frame rates

DEPENDENCIES:
- TIME.fixedDeltaTime from config (constant, not passed as parameter)

USAGE:
import { PowerSystem } from './entities/components/power.js';
const power = new PowerSystem(POWER);
========================================
*/

import { POWER, TIME } from '../../config.js';

export class PowerSystem {
   constructor(config = POWER) {
      this.maxPower = config.MAX_POWER;
      this.initialPower = config.CURRENT_POWER;
      this.current = config.CURRENT_POWER;
      this.lowPowerThreshold = config.LOW_POWER_THRESHOLD;
      this.drainRate = config.DRAIN_RATE;
      this.upgradeBonusPerLevel = config.UPGRADE_MAX_POWER_BONUS ?? 20;
   }

   reset() {
      this.current = this.initialPower;
   }

   // Scales maxPower based on upgrade level. Level 1 = base, higher = more capacity.
   setMaxPower(level) {
      this.maxPower = this.initialPower + (Math.max(1, level) - 1) * this.upgradeBonusPerLevel;
      // Keep current within new cap
      this.current = Math.min(this.current, this.maxPower);
   }

   drain(rate = this.drainRate) {
      this.current = Math.max(0, Math.min(this.current - rate * TIME.fixedDeltaTime, this.maxPower));
   }

   isEmpty() {
      return this.current <= 0;
   }

   isLow(threshold = this.lowPowerThreshold) {
      return this.current <= this.maxPower * threshold;
   }

   getPercent() {
      return this.current / this.maxPower;
   }
}
