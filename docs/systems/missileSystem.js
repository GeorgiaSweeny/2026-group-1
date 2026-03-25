/*
========================================
VERSION: 1.0
SYSTEM: MISSILE SYSTEM
AUTHOR: Ben Mounce
DESCRIPTION:
- Manages underwater missiles launched by the player
- Auto-targeting system for enemies and breakable walls
- Handles missile movement, collision, and destruction

RULES:
- Missiles lock on to nearest valid target
- Missiles are destroyed on impact or timeout

Limitations:
- Homing only reads position on where enemy was at time of launch
- Would be preferred if missiles destroyed larger areas in easy mode
  only one tile in hard mode
========================================
*/

import { MISSILE } from '../config.js';
import { isColliding, Hitbox } from './hitboxSystem.js';

class Missile extends Hitbox {
    constructor(x, y, target, facing = 1, speed = MISSILE.SPEED, turnSpeed = MISSILE.TURN_SPEED) {
        super(x, y, MISSILE.SIZE, MISSILE.SIZE);
        this.position = createVector(x, y);
        this.velocity = createVector(facing * speed, 0); // initial direction based on facing
        this.target = target;
        this.speed = speed;
        this.turnSpeed = turnSpeed;
        this.lifetime = MISSILE.LIFETIME;
        this.pendingDestroy = false;
        this.nextPos = createVector(x, y); // for collision system
        this.bubbles = [];
    }

    update(fixedDeltaTime) {
        this.lifetime -= fixedDeltaTime * 1000;
        if (this.lifetime <= 0) {
            this.pendingDestroy = true;
            return;
        }

        // spawn bubbles behind missile
        if (random() < 0.4) {
            const angle = this.velocity.heading();
            const backDist = this.w; // spawn at tail
            const bx = this.position.x - cos(angle) * backDist;
            const by = this.position.y - sin(angle) * backDist;
            
            this.bubbles.push({
                x: bx,
                y: by + (random(-2, 2)),
                size: random(2, 5),
                life: 255
            });
        }

        // update existing bubbles
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            b.y -= 0.5;
            b.x += random(-0.2, 0.2);
            b.life -= 5;
            if (b.life <= 0) {
                this.bubbles.splice(i, 1);
            }
        }
        // homing logic
        if (this.target && !this.target.pendingDestroy && !this.target.isDestroyed && this.target.position) {
            const targetPos = this.target.position;
            const missilePos = this.position;
            const dist = p5.Vector.dist(targetPos, missilePos);

            const desiredDirection = p5.Vector.sub(targetPos, missilePos).normalize();
            const currentDirection = this.velocity.copy().normalize();
            let effectiveTurnSpeed = this.turnSpeed;
            if (dist < 100) {
               effectiveTurnSpeed *= 4; 
            }
            const steer = p5.Vector.lerp(currentDirection, desiredDirection, effectiveTurnSpeed * fixedDeltaTime); // steer towards target
            steer.normalize();
            this.velocity = steer.mult(this.speed);
        }

        // move
        const step = p5.Vector.mult(this.velocity, fixedDeltaTime);
        this.position.add(step);
        this.nextPos.set(this.position);

        this.x = this.position.x;
        this.y = this.position.y;
    }
}

export function createMissileSystem(player, getTargets, getWalls) {
    let missiles = [];
    let lastFireTime = 0;

    function findNearestTarget(px, py, targets) {
        let nearest = null;
        let minDistSq = Infinity;

        // use target argument for enemies
        const enemyList = Array.isArray(targets) ? targets : (targets?.() ?? []);

        const wallRes = (typeof getWalls === 'function') ? getWalls() : (getWalls || []);
        const wallList = Array.isArray(wallRes) ? wallRes : [];
        const breakableWalls = wallList.filter(w => w.isBreakable);
        const allPotentialTargets = [...enemyList, ...breakableWalls];

        for (const target of allPotentialTargets) {
            if (target.pendingDestroy || target.isDestroyed) continue;
            const tx = target.position ? target.position.x : target.x;
            const ty = target.position ? target.position.y : target.y;

            if (tx === undefined || ty === undefined) continue;

            const dx = tx - px;
            const dy = ty - py;

            //missile forward check
            if (dx * player.facing <= 0) continue;
            const distSq = dx * dx + dy * dy;

            // max homing range
            if (distSq > 400 * 400) continue;
            if (distSq < minDistSq) {
                minDistSq = distSq;
                nearest = target;
            }
        }
        return nearest;
    }

    return {
        update(fixedDeltaTime) {
            const now = performance.now();
            
            for (let i = missiles.length - 1; i >= 0; i--) {
               const missile = missiles[i];
               missile.update(fixedDeltaTime);
               
               if (missile.pendingDestroy) {
                  missiles.splice(i, 1);
                  continue;
               }

               const enemies = Array.isArray(getTargets) ? getTargets : (getTargets?.() ?? []);
               const walls = Array.isArray(getWalls) ? getWalls : (getWalls?.() ?? []);
               const allEntities = [...enemies, ...walls];
                
               for (const entity of allEntities) {
                  if (entity.pendingDestroy || entity.isDestroyed) continue;
                  if (isColliding(missile, entity)) {
                     const isWall = walls.includes(entity);
                     if(isWall){
                        if (entity.isBreakable) {
                           entity.isDestroyed = true;
                        }
                     } else {
                        entity.pendingDestroy = true;
                     }
                     missile.pendingDestroy = true;
                     break;
                     
                  }
               }
            }
            // clean up missiles
            missiles = missiles.filter(m => !m.pendingDestroy);
            // handle launch intent
            if (player.actionIntent.launchMissile) {
                const timeSince = now - lastFireTime;
                
                if (timeSince > MISSILE.COOLDOWN) {
                    const target = findNearestTarget(player.position.x, player.position.y, getTargets, getWalls);
                    missiles.push(new Missile(player.position.x, player.position.y, target, player.facing));
                    lastFireTime = now;
                } 
                player.actionIntent.launchMissile = false; 
            }
        },
        
        getMissiles() {
            return missiles;
        }
    };
}
