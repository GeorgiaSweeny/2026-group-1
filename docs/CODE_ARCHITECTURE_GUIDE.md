# CODE ARCHITECTURE GUIDE

*(UPDATED: 11/02/26)*

The LightingSystem was extracted from the RenderSystem to reduce coupling between visual masking logic and drawing logic. This improves modularity, allows independent testing of visibility behaviour, and supports incremental development of the sonar mechanic without destabilising rendering.

## Overview

This project uses a **Modular** **state-driven architecture** with a **clear separation between logic, rendering, and input**. The goal of this structure is to make features easy to add without breaking existing systems. 

By separating **update** and **draw** **phases**, the code remains predictable, **frame-rate independent**, and easier to debug.

**IMPORTANT NOTE:**

The p5.js Web Editor does **not** support ES module imports → **switch to local development!**

The most up to date *non-modular* version of this project that will run on the web editor is v2.3 (SINGLE FILE VERSION): [https://github.com/UoB-COMSM0166/2026-group-1/blob/496a6811c6db81a47fa46beab3b390756c9f7b2c/docs/georgia/platformer_dev_2.3/SINGLE FILE VERSION/sketch.js](https://github.com/UoB-COMSM0166/2026-group-1/blob/496a6811c6db81a47fa46beab3b390756c9f7b2c/docs/georgia/platformer_dev_2.3/SINGLE%20FILE%20VERSION/sketch.js)

## 🏁 Final architecture snapshot

```

InputSystem       → intent
PlayerSystem      → apply intent
PhysicsSystem     → resolve motion
ResourceSystem    → manage power drain & replenishment
TorchSystem       → torch state & power usage
LightingSystem    → visibility rules & masking
RenderSystem      → draw visible state
Engine            → orchestrates

```
**Key Separation:**
- LightingSystem decides what is visible
- RenderSystem decides how it is drawn
- 
This prevents lighting logic from contaminating drawing logic.

---

# Game Project — Code Structure & Style Guide

## 1. Project Root

```
/project-root
│
├─ index.html             # HTML file that loads p5.js and sketch.js
├─ config.js              # Config file, for constants: gravity, jump power,
|                                                       canvas size
├─ sketch.js              # Main file: p5.js canvas, engine wiring,
|                                      darknessLayer, input bridge
├─ /gameEngine
│   └─ engine.js          # Engine class, runs update loop, registers systems
├─ /systems               # Modular game systems
│   ├─ inputSystem.js     # Handles input logic, sets player.intent
│   ├─ playerSystem.js    # Applies input intent to player (movement/jump)
│   ├─ physicsSystem.js   # Gravity, collisions, landing checks
│   ├─ torchSystem.js     # Torch behaviour, flicker, power drain
|   ├─lightingSystem.js   # Handles visibility rules & masking logic 
│   └─ renderSystem.js    # Draws everything: background, platforms, player,
|                                             torch, UI
├─ /entities              # Optional: reusable classes
│   ├─ player.js          # Player class / data structure
│   └─ torch.js           # Torch class
|          
├─ /assets                # Images, sprites, sounds
│   ├─/images
|   | └─forrest.png
|   ├─/sprites
|   └─/sounds
| 	
└─ /utils                 # Optional: helper functions (e.g., constrain, lerp)
```

> Config answers “what should exist?”
> 

> Instances ( eg. const torch = new Torch() )answer “what exists right now?”
> 

> Systems answer “what happens each frame?”
> 

---

## 2. File Responsibilities

| File                   | Responsibility                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| **sketch.js**          | Creates canvas; creates `darknessLayer`; initializes entities; registers systems; forwards input. |
| **engine.js**          | Runs update loop; calculates `deltaTime`; calls systems in order.                                 |
| **inputSystem.js**     | Sets player intent flags only. No direct state mutation.                                          |
| **playerSystem.js**    | Applies movement and jump logic based on intent.                                                  |
| **physicsSystem.js**   | Handles gravity and AABB collision resolution.                                                    |
| **resourceSystem.js**  | Manages power drain, replenishment, and game-over checks.                                         |
| **torchSystem.js**     | Manages torch state, flicker timing, torch radius.                                                |
| **lightingSystem.js**  | Controls darkness overlay, sonar reveal masks, torch light masking, fade logic.                   |
| **renderSystem.js**    | Draws background, platforms, player, enemies, and composites `darknessLayer` onto canvas.         |
| **entities/player.js** | Player class definition and default stats.                                                        |
| **entities/torch.js**  | Torch configuration and radius defaults.                                                          |

---

## 3. System Interaction & Update Flow

```

p5.js runtime
│
▼
Engine.update(deltaTime)
│
▼
SYSTEM UPDATES (in order)

1. InputSystem
   → sets player.intent

2. PlayerSystem
   → applies movement

3. PhysicsSystem
   → resolves gravity & collisions

4. ResourceSystem
   → drains power & handles pickups

5. TorchSystem
   → updates torch state

6. LightingSystem
   → updates visibility masks (torch + sonar)

7. RenderSystem
   → draws visible world
   → composites darknessLayer
   → draws UI
|
▼
Main canvas updated

```

- `deltaTime` ensures all movement/power drain is **frame-rate independent**.
- **darknessLayer** is an offscreen buffer: drawn each frame by Render System, composited onto main canvas for torch lighting.


### Why LightingSystem Comes Before RenderSystem

**Lighting determines:**

- What should be visible this frame

**Rendering then:**

- Draws the scene

- Applies the darkness mask

- Displays final composited frame


This seperation stops the render file from becoming long, unclear and difficult to test.


---

## 4. Input Handling (p5.js)

- Continuous input → `update()` sets flags in `player.intent` (`left`, `right`)
- Discrete actions → `onKeyPressed()` sets `jump` or `toggleTorch`
- Example:

```jsx
functionkeyPressed() {
  inputSystem.onKeyPressed?.(key);
}functionkeyReleased() {if (key ==='A' || key ==='a') player.intent.left =false;if (key ==='D' || key ==='d') player.intent.right =false;
}
```

---

## 5. Entity / System Guidelines

- **Entities**: just data and state; no p5 rendering or logic outside their system
- **Systems**: update player/game state; optionally have `draw()` for rendering; no side-effects on unrelated systems
- **Render system**: read-only; only draws current state; uses `darknessLayer` for lighting
- **Engine**: orchestrates updates & draws all systems each frame

---

## 6. Coding Rules

1. No drawing inside `update()` functions.
2. No state changes inside `draw()` functions.
3. Input sets **intent**, systems apply **logic**.
4. Keep systems modular: they shouldn’t know about unrelated systems.
5. Use `deltaTime` for any time-based updates (movement, power drain, flicker).
6. For new features, create a new system and register it in `sketch.js`.

# 7. File / Feature Templates

Use this at the top of **any new file or major section**:

```jsx
/*
========================================
VERSION: 1.0
SYSTEM: eg. Torch / Enemy / UI / Physics
AUTHOR/s: Name
DESCRIPTION:
- What this system does
- What data it reads
- What data it modifies

RULES:
- No drawing in update functions
- No state changes in draw functions
- Where possible use deltaTime to be FPS-safe
========================================
RESPONSIBILITIES:
- What this system explicity deals with and handles

DEPENDENCIES:
(e.g.)
- requestAnimationFrame (browser API)
- performance.now() for high-precision timing

USAGE:
- 
========================================
TODO / LIMITATIONS:
- Comments
========================================
NOTES:
- Comments
- breif explainations for team if unfamilliar concept used in code
	e.g. deltaTime
*/
```

And this structure for **features/system files**:

```jsx
(HEADER)
...
//======================================
// X (class)
//======================================

// class code...

//======================================
// X System
//======================================
// contains x logic

// import dependencies from ./filepath
	 ...
	
// export function Xsystem() {
	// update()...
	// draw()...
	}

//======================================
// X instance
//======================================

// let x = new X();

//======================================
// End
//======================================

```

## Sanity checklist (is this code in the correct place?)

### Input System checklist

- [ ]  Does NOT move entities
- [ ]  Does NOT apply physics
- [ ]  Sets intent or triggers actions
- [ ]  Uses events vs held input correctly

### Render System checklist

- [ ]  No state mutation
- [ ]  No deltaTime usage
- [ ]  Reads state only
- [ ]  All drawing lives here

Q1:

“Where should I put this drawing code?”

Answer: Draw code always lives in **Render system.**

Q2:

“Where should I change player movement?”

Answer: **Player system** or **Physics system — never Input or Render.**

---

## 8. Engine + Systems + Input Bridge Diagram

```jsx
        ┌──────────────────────┐
        │        p5.js         │
        │   (runtime / DOM)    │
        └───────────┬──────────┘
                    │ keyPressed() / keyIsDown()
                    ▼
        ┌──────────────────────┐
        │     Input Bridge     │  ← Lives in sketch.js
        │ (global p5 callbacks)│
        └───────────┬──────────┘
                    │ forwards key events
                    ▼
        ┌──────────────────────┐
        │     Input System     │
        │  - update()          │
        │  - onKeyPressed()    │
        │  - sets player.intent│
        └───────────┬──────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │     Player System    │
        │  - reads intent      │
        │  - applies movement  │
        │  - jump logic        │
        └───────────┬──────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │    Physics System    │
        │  - gravity           │
        │  - collision         │
        │  - ground checks     │
        └───────────┬──────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │     Torch System     │
        │  - drain power       │
        │  - flicker timing    │
        │  - active state      │
        │  - exposes light     |
        └───────────┬──────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │   Lighting System    │
        │  - collects lights   │
        │  - calculates radius │
        │  - prepares light    │
        │    data for render   │
        └───────────┬──────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │     Render System    │
        │  - draw background   │
        │  - draw platforms    │
        │  - draw player       │
        │  - draw darknessLayer│
        │  - applyLights()     │
        │  - draw UI           │
        └───────────┬──────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │       Canvas         │
        │   (visual output)    │
        └──────────────────────┘
```


---

## 9. Engine Update + Render Flow

```jsx
p5.js runtime ──► requestAnimationFrame(engine.update)

        │
        ▼
┌───────────────────────────────┐
│        Engine.update(time)    │
│ ───────────────────────────── │
│ deltaTime = time - lastTime   │
│ lastTime = time               │
└──────────────┬────────────────┘
               │
               ▼
      ┌───────────────────------┐
      │   SYSTEM LOOP           │
      │ for each system s       │
      │   s.update?.(deltaTime) │
      └───────┬──────────------─┘
              │
              ▼
  ┌───────────────────────────────┐
  │ SYSTEM UPDATES (order matters)│
  ├───────────────────────────────┤
  │ 1. Input System               │
  │    - updates player.intent    │
  │    - sets discrete actions    │
  ├───────────────────────────────┤
  │ 2. Player System              │
  │    - reads intent             │
  │    - applies movement/jump    │
  ├───────────────────────────────┤
  │ 3. Physics System             │
  │    - gravity & collisions     │
  │    - landing on platforms     │
  ├───────────────────────────────┤
  │ 4. Torch System               │
  │    - updates flicker timers   │
  │    - drains player power      │
  │    - toggles light on/off     │
  └───────────────┬───────────────┘
                  │
                  ▼
       ┌────────────────────----─┐
       │ Render System           │
       │ - draw background       │
       │ - draw platforms        │
       │ - draw player           │
       │ - draw darknessLayer    │   
       │    • drawDarknessBase() │
       │    • applyTorchLight()  │
       │ - draw UI               │
       └───────────────┬─────--──┘
                       │
                       ▼
               Main Canvas
               (pixels updated)

```

---

## Definitions

### Entities

Entities are **plain objects**, not classes.

- Entities store **state**, not behaviour
- Behaviour lives in functions that operate on entities
- Makes refactoring and debugging easier
- Supports future upgrades (*items, stats, abilities*)

Example: player, torch (instance)

```jsx
var player = {
  x, y,
  w, h,
  
  vy, (*vertical velocity*)
  jumpPower,
  
  maxPower,
  power,
  
  torchOn,
  
  onGround
};
```

---

### DeltaTime

<aside>
⚙

In p5.js, `deltaTime` is:

*The number of milliseconds since the last frame*

So if the game is running at:

- **30 FPS** → `deltaTime ≈ 33.33`
- **60 FPS** → `deltaTime ≈ 16.67`
- **120 FPS** → `deltaTime ≈ 8.33`

It *changes every frame* depending on performance.

- `deltaTime` is in **milliseconds**
- Game logic is easier in **seconds** → `deltaTime / 1000`

**Power Drain Example**

The power drain when the torch is on follows this pattern:

`value -= rate * deltaTimeInSeconds;` 

- `deltaTime / 1000` = elapsed **seconds**
- Subtracting that every frame adds up to **exactly 1 unit per second**
    
    `player.power -= deltaTime / 1000`  *(rate is effectively 1)*
    
</aside>
