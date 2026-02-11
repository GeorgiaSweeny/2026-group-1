# Prioritised Feature Breakdown
A risk-managed development approach prioritising core mechanics and technical feasibility over feature breadth.
Based on user stories derived from our game Epics

| **Priority**   | **Systems / Features**                                                   | **Estimated Implementation Time** |
| -------------- | ------------------------------------------------------------------------ | --------------------------------- |
| **HIGH (MVP)** | Player controls (movement, jump, sonar input, torch toggle)              | 2–4 days                          |
|                | Underwater physics system (floaty gravity, drag, capped fall speed)      | 3–5 days                          |
|                | Minimal gameplay UI (power meter, sonar cooldown, pause)                 | 1–3 days                          |
|                | Resource management (power drain over time + torch drain)                | 2–4 days                          |
|                | Basic enemies / hazards (static or simple patrol + contact damage)       | 3–5 days                          |
|                | Core Metroidvania structure (3–5 rooms, 1 gate, clear objective)         | 4–6 days                          |
|                | Lighting system (darkness overlay + visibility masking)                  | 5–8 days                          |
|                | Echolocation / Sonar system (pulse, circular reveal, fade-out, cooldown) | 6–10 days                         |
| **MEDIUM (Core Depth)** | Torch visual enhancement (improved lighting radius)            | 1–3 days                          |
|                         | Exploration ability (e.g., double jump unlock)                 | 2–4 days                          |
|                         | Simple upgrade system (increase sonar range or power capacity) | 3–5 days                          |
|                         | Enemy awareness to sonar (alert state within pulse radius)     | 4–7 days                          |
| **LOW (Stretch)** | Save system (checkpoint-based)                              | 2–4 days                          |
|                   | Achievement system (internal milestone tracking)            | 1–2 days                          |
|                   | Advanced enemy AI (hunt behaviour, multi-state logic)       | 4–8 days                          |
|                   | Sonar-reactive mini-boss encounter                          | 5–10 days                         |
|                   | Environmental physics extensions (currents, pressure zones) | 3–6 days                          |
|                   | Public player database / leaderboard                        | 7–14+ days                        |


# HIGH PRIORITY (MVP – Core Game)

These systems are essential to demonstrate the game concept and learning outcomes.

Without these, the game does not function.

## 1. Player Controls

**Why:**
A platformer must feel responsive and predictable.

**Includes:**

Horizontal movement

Jumping

Sonar activation

Torch toggle

Frame-rate independent movement

This system already partially exists and should be stabilised before expanding features.

## 2. Underwater Physics System

**Why:**
The underwater setting must feel mechanically distinct.

**Includes:**

Reduced gravity

Movement drag

Slower acceleration

Capped fall speed

This should remain simple — no full physics engine.

## 3. Resource Management (Power System)

**Why:**
Power creates tension and decision-making.

**Includes:**

Passive drain over time

Increased drain when torch is active

Replenishment via pickups

Game over at zero

**For MVP:**
Only Power is required. Oxygen can be cut if complexity rises.

## 4. Minimal Gameplay UI

**Why:**
Players need readable feedback.

**Includes:**

Power bar

Sonar cooldown indicator

Pause functionality

Polish is secondary to clarity.

## 5. Basic Enemies / Hazards

**Why:**
Risk must exist for tension.

**Includes:**

Static hazards OR simple patrol enemy

Contact damage

No advanced AI required

Collision should use simple AABB only.

## 6. Core Metroidvania Structure

**Why:**
Defines the genre identity.

**Includes:**

3–5 interconnected rooms

One gated path

One unlockable ability (e.g., double jump)

Clear progression objective

The map should be small but structured.

## 7. Lighting System

**Why:**
Darkness gives sonar meaning.

**Includes:**

Darkness overlay

Visibility masking

Clear contrast between revealed and hidden areas

This does not need shaders — simple masking is sufficient.

## 8. Echolocation / Sonar System

**Why:**
This is the game’s unique identity.

Includes:

Circular pulse

Temporary reveal

Fade-out over time

Cooldown

Integration with lighting layer

This is the most technically risky system and should be prototyped early.

# MEDIUM PRIORITY (Depth & Design Strength)

These enhance gameplay but are not required for MVP delivery.

Torch Enhancement

Stronger lighting radius and clearer contrast vs sonar.

Exploration Ability Unlock

Example:

Double jump

Wall jump

Only one ability is required to demonstrate gating.

Simple Upgrade System

Example:

Increase sonar range

Increase power capacity

Should remain menu-based and minimal.

Enemy Awareness to Sonar

Enemies react when inside pulse radius:

Enter alert state

Move toward last pulse origin

Must remain simple state logic (idle → alert → return).

No complex AI trees.

# LOW PRIORITY (Stretch / Showcase)

These features increase complexity but are not necessary to demonstrate learning outcomes.

Save system

Achievement tracking

Advanced AI

Mini-boss

Environmental physics extensions

Online database

If time becomes tight, these should be removed first.
