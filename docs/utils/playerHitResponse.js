/*
========================================
UTILITY: PLAYER HIT RESPONSE
AUTHOR: Georgia Sweeny
DESCRIPTION:
- Handles player damage and knockback when the player overlaps
  with any damaging entity (enemy, hazard, etc.)
- Treats all sources generically — no type-specific logic
- Enforces an invulnerability window to prevent repeated rapid hits
- If the source exposes w/h bounds, also resolves the player's
  position out of the source every frame (before i-frame check)
  so the player can never enter solid objects.

RULES:
- No rendering or drawing
- Does not depend on enemy or hazard implementation details
- Source only needs to expose a center position (position.x/y or x/y)

USAGE:
import { handlePlayerHit } from '../utils/playerHitResponse.js';
handlePlayerHit(player, sourceEntity, COMBAT);
========================================
*/

//======================================
// PLAYER HIT RESPONSE
//======================================
import { TIME } from '../config.js';

export function handlePlayerHit(player, source, config) {
   const srcX = source.position?.x ?? source.x;
   const srcY = source.position?.y ?? source.y;

   const dx = player.position.x - srcX;
   const dy = player.position.y - srcY;
   const dist = Math.sqrt(dx * dx + dy * dy);

   const normX = dist > 0 ? dx / dist : 1;
   const normY = dist > 0 ? dy / dist : 0;

   // --- Position correction (runs every frame, ignores i-frames) --- //
   // Pushes the player out of any source that exposes its bounds (w/h),
   // preventing the player from entering hazards or glow objects.
   const srcW = source.w ?? source.width ?? source.getWidth?.() ?? null;
   const srcH = source.h ?? source.height ?? source.getHeight?.() ?? null;
   if (srcW && srcH) {
      const pw = player.w ?? 16;
      const ph = player.h ?? 16;
      const overlapX = (pw / 2 + srcW / 2) - Math.abs(dx);
      const overlapY = (ph / 2 + srcH / 2) - Math.abs(dy);
      if (overlapX > 0 && overlapY > 0) {
         if (overlapX < overlapY) {
            player.position.x += overlapX * (Math.sign(dx) || 1);
         } else {
            player.position.y += overlapY * (Math.sign(dy) || 1);
         }
      }
   }

   // --- i-frame check --- //
   const now = millis();
   if (player.lastHitTime != null && now - player.lastHitTime < config.IFRAME_DURATION_MS) {
      return;
   }

   // --- Apply knockback velocity --- //
   player.velocity.x = normX * config.KNOCKBACK_STRENGTH * TIME.fixedDeltaTime;
   player.velocity.y = normY * config.KNOCKBACK_STRENGTH * TIME.fixedDeltaTime
      - config.KNOCKBACK_LIFT * TIME.fixedDeltaTime;

   // --- Record hit timestamp --- //
   player.lastHitTime = now;
   player.damageFlashTime = now;
   player.damageFlashColor = 'red';
}

//======================================
// END
//======================================
