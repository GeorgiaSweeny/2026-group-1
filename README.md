<html>
	<body style="text-align: center;">
		<div align="center">
		   <h1> University  of  Bristol <br/>
		   COMSM0166 - Group 1 (2026) <br/></h1>
		</div>
		<div align="center">
		   <h2> THE ABYSS </h2> 
			Can you escape the endless dark? <br/><br/>
			[ADD PROMO IMAGE]
		</div>
		<div align="center">
 			<h3 align=center><a href="https://uob-comsm0166.github.io/2026-group-1/">Play Current Version - V4</a></h3>
		</div>
	</body>
</html>



### Video DEMO v4 (2-3 mins long max)
*(updated 05/03/26)*


https://github.com/user-attachments/assets/511bb68b-5e3b-4c63-b410-d253316b1b56











<br/>
<br/>


# Our Team - Group 1

![Group1](/project-docs/images/Group1.jpeg)

</br>

|Name|Email|Role|
|:-|:-|:-|
|Archie Brown|cq25988@bristol.ac.uk| Co-developer; Lead UI Developer |
|Monal Gupta|ta25702@bristol.ac.uk| Co-developer; Report contributor; Video Production |
|Ben Mounce|wv25183@bristol.ac.uk| Co-developer; Report contributor; Video Production |
|Georgia Sweeny|dp25498@bristol.ac.uk| Lead developer; System Architect; Code reviewer |
|Nick Jankov|ve21144@bristol.ac.uk| Co-developer & Code Reviewer |
|Jude Hsu|ca20853@bristol.ac.uk| Report contributor; Co-developer |

</br>

### Kanban Board & Organisation

[GitHub Kanban](https://github.com/orgs/UoB-COMSM0166/projects/171/views/1) - Used track feature tracking & tickets

[Notion Kanban Page](https://www.notion.so/2eef3902b1f0803590afe2a31c236dab?v=2eef3902b1f080509478000c3aa3a4a6&source=copy_link) - Used to manage general planning, organisation, share and document research (hub)

---
</br>


# Project Report

## 1. Introduction
Our game is a tense, underwater exploration adventure where players navigate their way out of abyss using movement, resource management, and environmental interaction. The core twist is the 
echolocation-based sonar mechanic, which allows players to temporarily reveal their surroundings in an otherwise dark and hazardous environment. This mechanic drives both gameplay and atmosphere,
creating tension and encouraging strategic decision-making.

The game draws inspiration from Metroidvania-style design, featuring interconnected rooms, gated areas unlocked through new abilities, and challenges that reward exploration and mastery. Unlike traditional
underwater games, the use of sonar as a primary navigation and discovery tool sets it apart, providing a fresh experience where visibility is limited and deliberate planning is essential.

Players must manage resources such as power, and health while exploring unknown areas. Strategic use of the torch and sonar is crucial, as these tools consume resources but are necessary for
survival and progression. This combination of limited visibility, environmental hazards, and resource management emphasizes careful exploration over fast-paced action, creating an immersive and atmospheric
gameplay loop.

The game’s novelty lies in how the sonar mechanic integrates with world design, enemies, and lighting. It encourages players to think tactically, interact meaningfully with the environment, and engage with
risk versus reward. By combining a familiar exploration framework with a unique visibility mechanic, the game provides a distinctive experience** that is both challenging and rewarding, appealing to players
seeking depth, immersion, and discovery in an underwater setting**.

## 2. Requirements 
### 2.1 Early Stage Design & Ideation
The game concept was developed collaboratively through group discussions and pitch proposals. During the early design phase, we used Notion to document and refine ideas. Each team member proposed a concept [Figure 1: Game Ideas], and the team then voted on their preferred option [Figure 2: Poll Results for Game Ideas]. Two of the proposed concepts were centred on echolocation, which helped establish it as the foundation of the project. Through further discussion, the selected concept evolved into an underwater exploration game, where limited visibility creates tension and supports the overall atmosphere. The game’s core differentiator is its sonar-based mechanic, supported by darkness and resource management systems.

<table align="center">
  <tr>
    <td align="center">
      <img src="project-docs/report_figures/Figure 1 - Game Ideas.png" alt="Figure 1" width="300"><br>
      <sub>Figure 1: Game Ideas</sub>
    </td>
    <td align="center">
      <img src="project-docs/report_figures/Figure 2 - Poll Results for Game Ideas.png" alt="Figure 2" width="300"><br>
      <sub>Figure 2: Poll Results for Game Ideas</sub>
    </td>
  </tr>
</table>

### 2.2 Paper Prototypes
In the early stage of development, we created a paper prototype to visualise and test the flow of the game’s core mechanics. This stage allowed the team to explore the overall layout of the game and discuss key design elements such as enemies, player objectives, setting, and what would make the game engaging. Paper prototyping also provided a low-cost way to experiment with ideas before moving into implementation.

We later asked testers to play through the prototype and share feedback. Their responses helped identify the most engaging aspects of the design, with the echolocation mechanic receiving particularly positive reactions. Testers highlighted the tension created by limited visibility and sonar use, which helped validate both the core mechanic and the underwater setting.

Based on this feedback, the team shaped the game around exploration, tension, and careful resource use. A Metroidvania-inspired structure was chosen to support these goals, allowing progression through interconnected spaces, restricted areas, and gradual access to new abilities. This worked well with the sonar mechanic, as players needed to decide when to reveal their surroundings and when to conserve resources. Overall, the paper prototyping stage helped clarify the game’s direction and confirmed that its main appeal lies in atmosphere, uncertainty, and controlled exploration.

<p align="center">
  <img src="project-docs/workshops/paper-prototype/SubGame.gif" alt="Paper prototype demo" width="500" />
</p>

### 2.3 Stakeholders - Onion Model
<p align="center">
    <img src="https://github.com/user-attachments/assets/b768743b-cfa2-456d-9c32-e7780289a064"
    alt="Stakeholders Onion Model" width="500" />
</p>


### 2.4 Epics and User Stories
We used epics and user stories to structure the game idea into a clearer and manageable development plan that the team could actually work with. At the start of the project, the overall concept was a bit too broad, so epics helped us organise the project into major areas of player experience and technical functionality, such as player movement, resource management, sonar and lighting, enemies, world progression, interface, and system architecture. 

For each epic, we wrote features from the perspective of the player, and in some cases from the perspective of the developer. This forced us to think about why a feature mattered, not just what needed to be coded.

We also used acceptance criteria to define what "completed" looked like. This helped make features more concrete and reduced ambiguity during implementation. It also make it easier to determine what belonged in the MVP and what could be ranked as lower priority.

The main thing we learned from this process was that epics and user stories were most useful when they stayed practical. They helped the team focus on player experience, communicate implementation priorities more clearly.

For repo readibility, we listed two representative examples below. The full set of epics, user stories, and acceptance criteria can be found in the following link: [Full list](Epics_and_user_stories.md)

#### EPIC 1 – Core Player Interaction
**Description:** The player must move, explore, and interact with the underwater world intuitively.  
**User Stories:**  
- As a competitive player, I want responsive movement, so that I feel in control underwater.
- As a player, I want to navigate vertical spaces, so that I can truly explore.
- As a casual player, I want intuitive controls, so that I can start playing immediately. 
- As a disabled player, I want remappable controls, so that I can play comfortably.
  
**Acceptance Criteria:** Movement and physics are frame-rate independent; input is separated from logic; drag and capped fall speed applied consistently.

#### EPIC 2 – Resource & Survival Systems
**Description:** Players manage limited resources to create tension and strategic decision-making.  
**User Stories:**  
- As a player, I want power to drain over time, so that exploration feels risky.
- As a player, I want torch and sonar to consume additional power, so that I must choose when to use them.
- As a player, I want health to decrease when colliding with enemies, so there are tangable consequences.  
  
**Acceptance Criteria:** Resources drain continuously and predictably; Game Over triggers if any resource reaches zero; UI displays all resources clearly.

In addition to the inital concept proposals, the lead developer documented discussion points from the ideation stage and produced sevearal early room sketches and map layouts. These drawings helped the team make abstract ideas more concrete, compare possible structures, and visualise how exploration and progression might work in practice. Selectd examples of the maps are included below.

<table align="center">
  <tr>
    <td align="center">
      <img src="/Users/judebezos/Documents/2026-group-1/project-docs/map-design-photos/room sketches 1.jpg" alt="Figure 5" width="300"><br>
      <sub>Figure 3: Game Map Sketch</sub>
    </td>
    <td align="center">
      <img src="/Users/judebezos/Documents/2026-group-1/project-docs/map-design-photos/room sketches 2.jpg" alt="Figure 6" width="300"><br>
      <sub>Figure 4: Game Map Sketch</sub>
    </td>
  </tr>
</table>

### 2.6 Prioritised Feature Breakdown
To keep the development manageable and technically feasible, this project followed a risk-managed development approach prioritisation strategy. Core mechanics were given priority over feature breadth so that the team members could first deliver a stable and playable MVP. The breakdown below is based on our user stories derived from our game Epics.

```jude: i removed the time estimates. Keeping them requires additional explanation.```

| **Priority**            | **Systems / Features**                                                   |
| ----------------------- | ------------------------------------------------------------------------ | 
| **HIGH (MVP)**          | Player controls (intents: movement, sonar ping, torch toggle)            |
|                         | Physics (underwater movement, drag, collisions, hitboxes)                |
|                         | Minimal gameplay UI (power meter, sonar cooldown, pause)                 | 
|                         | Resource management (power drain + torch drain, replen)                  |
|                         | Lighting system (darkness overlay + visibility masking)                  | 
|                         | Echolocation / Sonar system (pulse, circular reveal, fade-out, cooldown) | 
|                         | Core Metroidvania structure (3–5 rooms, 1 gate, basic traversal)         | 
| **MEDIUM (Core Depth)** | Room system (room objects, transitions, bounds)                          | 
|                         | Camera system (follow player, clamp to room)                             | 
|                         | Torch visual enhancement (improved lighting radius)                      | 
|                         | Enemy system (basic patrol / contact damage)                             | 
|                         | Enemy awareness to sonar (alert state within pulse radius)               | 
|                         | Exploration ability (double jump unlock, etc.)                           | 
|                         | Simple upgrade system (increase sonar range or power capacity)           | 
| **LOW (Stretch)**       | Save system (checkpoint-based)                                           | 
|                         | Achievement system (internal milestone tracking)                         | 
|                         | Advanced enemy AI (hunt behaviour, multi-state logic)                    | 
|                         | Sonar-reactive mini-boss encounter                                       | 
|                         | Environmental physics extensions (currents, pressure zones)              | 
|                         | Public player database / leaderboard                                     | 

---
</br>

## 3. Design (DL: 25 Apr 2026)

This section explains the final system architecture of the game and how it evolved during development. At the start of the project, we used the p5.js online editor to prototype individual features, and we initially expected the design to be described using more traditional object-oriented modelling. However, as the prototype grew, maintaining shared game state across separate features became increasingly difficult.

Instead of placing most behaviour inside a few large classes, the project developed into a more modular, system-oriented structure where game data, input, logic, rendering, and world state are separated into distinct responsibilities. The final design is therefore not strongly inheritance-based. The diagrams in this section explain the implemented architecture, focusing on shared state, system responsibilities, and runtime behaviour.

We also created a code architecture guide ([CODE_ARCHITECTURE_GUIDE.md](CODE_ARCHITECTURE_GUIDE.md)) to help team members understand the overall structure of the codebase and become familiar with the responsibilities of each system.

### 3.1 System Architecture
The project is built using a **modular, state-driven architecture** that separates **logic, rendering, input, and game world state.** Each system has a clear responsibility and operates on shared state in a controlled order. This simplifies our debugging work, allows independent testing, and reduces unintended side-effects when new features are added.

This **high-level architecture snapshot** illustrates the responsibilities of each system:

```
InputSystem        → intent
PlayerSystem       → apply intent (movement + jump)
PhysicsSystem      → resolve motion & collisions
ResourceSystem     → manage power drain & replenishment
TorchSystem        → torch state & power usage
SonarSystem        → pulse logic & detection + alerts
RoomSystem         → current room state & transitions
CameraSystem       → viewport tracking & clamping
LightingSystem     → visibility rules & masking
EnemySystem        → AI movement & reactions
RenderSystem       → draw visible state
Engine             → orchestrates
```

**Key separation of concerns:**
- **LightingSystem** decides what is visible 
- **RenderSystem** decides how it is drawn.
- **CameraSystem** determines which portion of the world is in view.
- **RoomSystem** manages which data is active for the current room.

This separation helps keep the game predictable, testable, and modular. It also supports incremental development of complex systems like sonar without destabilising rendering.

### 3.2 Structural Architecture Diagram

The structural architecture diagram below shows how the main runtime components are organised. Instead of focusing on inheritance relationships, it shows how the game loop, shared data, update systems, and render systems are separated and connected during execution.

The diagram is divided into four parts:

1. **Core loop and inputs**

    This part shows the entry points of the game. p5.js event functions such as `keyPressed` and `draw` are handled by `sketch.js`, which acts as the main orchestrator and calls the engine during each frame.

2. **Data / entities**

    This part shows the shared state used by the systems, including the player object, room data, and global game state. These objects mainly store information such as position, velocity, power, room layout, and current game status.

3. **Update phase / logic**

    This part shows the order in which gameplay systems update the shared state. The engine runs systems such as input, player movement, physics, resources, torch, sonar, room transitions, and camera updates in sequence.

4. **Render phase**

    This part shows how the updated state is converted into screen output. Lighting and render systems use the current player, room, sonar, and camera data to draw the visible game world and overlay screens.

```mermaid

flowchart TD
    %% 1. CORE LOOP & INPUTS
    subgraph EngineLoop [1. Main Game Loop]
        direction TB
        P5Events([p5.js Events: keyPressed, draw])
        Engine{engine.js}
        Sketch((sketch.js Orchestrator))
        
        P5Events -->|Triggers| Sketch
        Sketch -->|Calls update| Engine
    end

    %% 2. DATA / ENTITIES
    subgraph DataState [2. Entities & Shared Data]
        direction LR
        Player[(Player Object<br/>Pos, Vel, Intent, Power)]
        RoomData[(Room State<br/>Walls, Items, Exits)]
        GameState((gameState))
    end

    %% 3. UPDATE LOGIC (Executed in sequence by Engine)
    subgraph UpdateSystems [3. Update Phase - Logic & Math]
        direction TB
        Input[inputSystem]
        PlayerSys[playerSystem]
        Physics[physicsSystem]
        Resource[resourceSystem]
        Torch[torchSystem]
        Sonar[sonarSystem]
        RoomSys[roomSystem]
        Camera[cameraSystem]

        Input -->|Sets Intent| PlayerSys
        PlayerSys -->|Calculates Velocity| Physics
        Physics -->|Resolves Walls| Resource
        Resource -->|Drains Power or Heals| Torch
        Torch -->|Checks Power limits| Sonar
        Sonar -->|Creates Pulses| RoomSys
        RoomSys -->|Triggers Exits| Camera
    end

    %% 4. RENDER PHASE
    subgraph RenderSystems [4. Render Phase - Screen Drawing]
        direction TB
        Lighting[lightingSystem]
        Render[renderSystem]
        Menus[Menu / Pause / Win Screens]

        Lighting -->|Provides Light Sources| Render
        Render -->|Draws World| Menus
    end

    %% CROSS-LAYER CONNECTIONS
    Engine -->|Iterates Systems| UpdateSystems
    UpdateSystems -->|Reads & Mutates| DataState
    
    %% Specific Data Dependencies for Rendering
    Player -.->|Pos, Power, Torch| Lighting
    Sonar -.->|Revealed Walls, Lights| Lighting
    Camera -.->|Offsets & Scale| Render
    DataState -.->|Provides current state| Render
    Sketch -->|Calls draw| RenderSystems

	%% SUBGRAPH BACKGROUNDS
    style EngineLoop fill:#FFDCDC,stroke:#333,stroke-width:0px
    style DataState fill:#FFF2EB,stroke:#333,stroke-width:0px
    style UpdateSystems fill:#FFE8CD,stroke:#333,stroke-width:0px
    style RenderSystems fill:#FFD6BA,stroke:#333,stroke-width:0px

```

### 3.3 Runtime Behavioural Flow: Sonar Activation

The structural architecture diagram shows how the main systems are connected. This behavioural flow shows how those systems cooperate during one core gameplay action: activating sonar.

<p align="center">
  <img src="project-docs/report_figures/F7-Runtime behaviour flow.png" alt="Runtime behaviour flow" width="250" />
</p>

This flow shows that sonar is not drawn directly from player input. The input first becomes an intent, then the relevant systems update resources, visibility, enemy behaviour, and rendering in sequence. This keeps the core mechanic modular and prevents rendering logic from being mixed with gameplay logic.

**This flow demonstrates:**

- input being translated into gameplay intent;
- resource checks controlling whether sonar can be used;
- sonar affecting visibility and enemy behaviour;
- rendering remaining separate from game logic.

### 3.4 UI Desgin
```jude: Archie, could you please provide a few reference game images which influenced your UI design please. these can be screenshots from games. I will add a few description. Thanks.```


### 4. Implementation (DL: 26 Apr 2026)

- 15% ~750 words

- Describe implementation of your game, in particular highlighting the TWO areas of *technical challenge* in developing your game. 

### 5. Evaluation (DL: 27 Apr 2026)

- 15% ~750 words
- One qualitative evaluation (of your choice) 
- One quantitative evaluation (of your choice) 
- Description of how code was tested. 

## User & Heuristic Evaluation

One participant was recruited from an adjacent group. Two observers recorded critical moments while the participant played through the prototype, verbalising their thoughts. Two tasks were set:
- Navigate from the starting room to the next area using the sonar mechanic
- Survive for as long as possible while managing the power resource

### Findings

**Atmosphere and core tension are working.** The limited torch radius created genuine curiosity. Players instinctively avoided unlit areas without being told to. The core design premise is landing as intended.

**No narrative direction was the most commonly raised issue.** Without a clear objective, players explored aimlessly and reported uncertainty about what they were working toward. Pete also highlighted this directly, even a minimal story setup (distress signal, missing crew) would give exploration a purpose. If the objective(collectible item) is hidden and sonar reveals it, the mechanic becomes narratively meaningful rather than purely mechanical.

**Enemies created no real tension.** Players navigated around them without strategic thought. Enemies reacting visibly to sonar like speeding up, changing direction, entering an alert state, would make encounters feel meaningful.

## Heuristic Evaluation

> **Severity = (Frequency + Impact + Persistence) / 3**

### Strengths

| Interface | Observation | Heuristic | F | I | P | Severity |
|---|---|---|---|---|---|---|
| Display placement | Power and sonar status in top-left follows gaming conventions. Players looked there instinctively | H4 – Consistency & Standards | 1 | 1 | 1 | 1.0 |
| Enemy design | Red enemy colour contrasts clearly against dark environment. Threats are immediately recognisable. | H4 – Consistency & Standards | 1 | 1 | 1 | 1.0 |
| Gameplay | No objective communicated. Player has no direction | H1 – Visibility of System Status | 4 | 4 | 4 | 4.0 |
| Game start | No controls displayed. Discovered through trial and error | H10 – Help & Documentation | 4 | 3 | 4 | 3.7 |
| Gameplay | Enemies deal contact damage with no warning animation or sound | H5 – Error Prevention | 3 | 3 | 3 | 3.0 |
| Game Over screen | No cause of death shown. Player cannot identify what went wrong | H9 – Help Users Recover from Errors | 3 | 3 | 3 | 3.0 |

### Difficulty Levels
Two difficulty levels will be selectable from the main menu:

**Easy** — slower power drain, wider torch radius, slower enemies, more pickups.

**Hard** — faster drain, narrower torch radius, more aggressive enemies, 
fewer or no pickups.

---

### 6. Process

Our team worked through a process of collaborative planning, exploratory prototyping, and later integration into a shared codebase. In the early stage, we used Notion to collect game ideas, record discussion points, and organise epics, user stories, and acceptance criteria. This helped us turn a broad underwater exploration concept into a more manageable development plan.

#### First sprint: exploratory prototyping

After agreeing on the main theme, we began with a two-week exploratory sprint. Team members selected feature areas from the user stories and built early prototypes using the p5.js online editor. These prototypes were then shared on Notion so that the rest of the team could review the design, compare different approaches, and decide which ideas were suitable for the MVP. This allowed us to test early versions of sonar, lighting, movement, UI, and room-navigation mechanics before committing to a single implementation.

<p align="center">
    <img src="project-docs/report_figures/F8-1-Feature Tests.png" alt="Feature tests" width="250" />
    <img src="project-docs/report_figures/F8-2-Feature Tests.png" alt="Feature tests" width="250" />
</p>

This approach worked well during the early creative stage because it encouraged low-risk experimentation. Team members could test ideas independently without immediately affecting the shared codebase, and the feature tests provided visual evidence that made discussions more concrete. However, the limitation of this approach became clearer during implementation. Since prototypes were built separately, they often used different assumptions about game state or object structure. As a result, they could not simply be copied into the final game and required additional integration work.

After the first sprint, we identified the tasks needed to move from separate prototypes toward a runnable MVP. Team members selected tasks based on their interests and added their names to the relevant task cards. [Figure 9] Alongside Notion, we used the GitHub Kanban board to track feature development, progress, and outstanding issues.

<p align="center">
    <img src="project-docs/report_figures/F9-1 Task Assignment.png" alt="Task assignment" width="250" />
    <img src="project-docs/report_figures/F9-2 Task Assignment.png" alt="Task assignment" width="250" />
</p>

<p align="center">
    <img src="project-docs/report_figures/F10-Kanban.png" alt="GitHub Kanban board" width="500" />
</p>

Although this gave the team a clearer task structure, it was difficult to follow perfectly in practice. Many features depended on unfinished work from other areas. For example, sonar, lighting, and camera movement all needed access to shared game state. This created overlap between tasks and made isolated development harder than expected. It also meant that task ownership was not always clear when several people were working on related systems at the same time.

#### First sprint retrospective

The main outcome of the first sprint was that the team had generated useful feature ideas, but the workflow was still too fragmented for implementation. The retrospective lesson was that prototypes were valuable for exploration, but they needed to be followed by clearer integration planning, shared architecture decisions, and better visibility over dependencies between tasks.

To respond to this, we moved toward shared ownership and peer review for some overlapping areas. For example, UI-related work involved more than one co-developer, and pull requests were reviewed by more than one person where possible. This reduced the risk of isolated decisions and gave the team more opportunities to check code quality. However, shared ownership also had limitations: when responsibilities were not clearly divided, it could become harder to know who had the final decision on a feature or whether a task was fully complete.

Team members also had different communication styles and worked at different stages of the project. This made regular coordination important. When communication was less consistent, it became harder to know which features were ready, which parts of the codebase had changed, and how different systems were expected to connect.

#### Second sprint: integration and MVP focus

The second sprint therefore focused more strongly on integration. Instead of creating further isolated prototypes, the team worked on combining the strongest ideas into a single playable version. We also prioritised the MVP more strictly, separating essential features from stretch goals and paying closer attention to how different systems interacted.

#### Second sprint retrospective

Overall, the team’s process evolved from open-ended exploration into a more structured development workflow. The early prototyping stage helped us discover the strongest mechanics, while the later integration stage helped us turn those mechanics into a playable game. The main lesson was that creative experimentation is useful at the start of a project, but it needs to be followed by clear ownership, integration planning, code review, and regular communication.


### 7. Sustainability (DL: 26 Apr 2026)

- 10% ~750 words

- Evidence of the impact of your game across the environment

### 8. Conclusion (DL: 27 Apr 2026)

- 10% ~500 words

- Reflect on the project as a whole. Lessons learnt. Reflect on challenges. Future work, describe both immediate next steps for your current game and also what you would potentially do if you had chance to develop a sequel.

### 9. Contribution Statement (DL: 25 Apr 2026)

- Provide a table of everyone's contribution, which *may* be used to weight individual grades. We expect that the contribution will be split evenly across team-members in most cases. Please let us know as soon as possible if there are any issues with teamwork as soon as they are apparent and we will do our best to help your team work harmoniously together.

### 10. AI Statement (DL: 25 Apr 2026)
~250 words

- summarise your teams use of AI so we know where to give you credit for work done.
- eg. to make game visuals, help writing code (help to debug, explictily writng any code with AI, to review code etc.) 

## 10. AI Statement
AI tools also affected the workflow. Since the team used AI support for coding, debugging, and documentation, review and integration became especially important. AI-assisted suggestions still had to be checked against the actual architecture of the game, particularly where systems shared state. This reinforced the need for code review, shared understanding, and clearer system boundaries.

### Additional Marks

You can delete this section in your own repo, it's just here for information. in addition to the marks above, we will be marking you on the following two points:

- **Quality** of report writing, presentation, use of figures and visual material (5% of report grade) 
  - Please write in a clear concise manner suitable for an interested layperson. Write as if this repo was publicly available.
- **Documentation** of code (5% of report grade)
  - Organise your code so that it could easily be picked up by another team in the future and developed further.
  - Is your repo clearly organised? Is code well commented throughout?
