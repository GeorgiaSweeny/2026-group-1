
### EPIC 1 – Core Player Interaction
**Description:** The player must move, explore, and interact with the underwater world intuitively.  
**User Stories:**  
- As a competitive player, I want responsive movement, so that I feel in control underwater.
- As a player, I want to navigate vertical spaces, so that I can truly explore.
- As a casual player, I want intuitive controls, so that I can start playing immediately. 
- As a disabled player, I want remappable controls, so that I can play comfortably.
  
**Acceptance Criteria:** Movement and physics are frame-rate independent; input is separated from logic; drag and capped fall speed applied consistently.

### EPIC 2 – Resource & Survival Systems
**Description:** Players manage limited resources to create tension and strategic decision-making.  
**User Stories:**  
- As a player, I want power to drain over time, so that exploration feels risky.
- As a player, I want torch and sonar to consume additional power, so that I must choose when to use them.
- As a player, I want health to decrease when colliding with enemies, so there are tangable consequences.  
  
**Acceptance Criteria:** Resources drain continuously and predictably; Game Over triggers if any resource reaches zero; UI displays all resources clearly.

### EPIC 3 – Sonar & Lighting Identity Mechanic
**Description:** The sonar system defines the game’s identity and atmosphere.  
**User Stories:**  
- As a player, I want to activate sonar, so that hidden areas are temporarily revealed.  
- As a player, I want revealed areas to fade over time, so that tension is maintained.  
- As a player, I want the torch to provide limited visibility, so that I can navigate carefully.
  
**Acceptance Criteria:** Sonar pulse reveals environment temporarily; lighting and rendering are modular; enemy reactions vary by type.

### EPIC 4 – Enemies & Challenge
**Description:** Enemies create risk and strategic gameplay in each room.  
**User Stories:**  
- As a player, I want enemies to patrol, so that the world feels alive.  
- As a player, I want enemies to react to sonar, torch, or proximity, so that encounters feel meaningful.  
- As a casual player, I want enemy behaviour to be readable, so that I can anticipate threats.
  
**Acceptance Criteria:** Room-specific enemies with defined states; collisions reduce health; reactions vary by enemy type.

### EPIC 5 – World Structure & Progression
**Description:** The world supports exploration and progression in a Metroidvania style.  
**User Stories:**  
- As a player, I want interconnected rooms, so that exploration feels cohesive.
- As a player, I want gated paths, so that new abilities unlock new areas.
- As a player, I want the camera to follow me, so that I am immersed in large rooms.
  
**Acceptance Criteria:** 3–5 interconnected rooms; abilities unlock new areas; camera clamps to room bounds; reaching final exit triggers win state.

### EPIC 6 – Interface & Game States
**Description:** Players navigate menus and understand game states clearly.  
**User Stories:**  
- As a player, I want a start menu, so that I can begin the game intentionally.
- As a player, I want a settings menu, so that I can adjust preferences.
- As a player, I want in-game UI for resources, so that I can manage power, air, and health.
- As a non-English speaker, I want the UI to use symbols, so that I can understand it without reading.
  
**Acceptance Criteria:** Menus pause gameplay; UI shows all resources; Game Over and Win states trigger correctly.

### EPIC 7 – Technical Architecture & Maintainability
**Description:** The system remains modular and extensible for collaborative development.  
**User Stories:**  
- As a developer, I want systems to have single responsibilities, so that debugging is easier.
- As a future developer, I want to add new systems without rewriting core logic, so that development remains scalable.
- As a JavaScript developer, I want logic separated from rendering, so that advanced features like layered lighting are easier to implement.
  
**Acceptance Criteria:** Modular systems (Input, Physics, Resource, Lighting, Enemy); central engine update order; lighting separated from rendering; deltaTime used for all time-based behaviour; room and camera systems manage world scale independently.