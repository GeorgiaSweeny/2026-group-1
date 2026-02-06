***Version 2.3***

**Aims:**
Modular Engine Architecture
  - the core “engine” is responsible for the game loop, physics, rendering pipeline, input management, etc.
  - everything else — like player, torch, power — are plug-in modules that the engine will call each frame
 
  - The engine doesn’t know the specifics of modules (e.g. player, torch)
  - Modules declare their phase and update/draw functions
  - draw is optional — some modules are logic only
 
**Benefits**
Engine is agnostic — *it only calls update() and draw() on modules*

Easy to swap modules — *e.g. replace player with AI or new physics*

Phases are enforced — *no messy interdependencies*

Debugging is easier — *engine shouldn’t break because a module fails*

**Principles**
CREATE OWN LIBRARIES
Create a library for time (systemClock.js)
Wrap it control it and mock it for tests to fast forward times 

INJECT CODE INTO ENGINE
Do not use global data if possible (causes issues with testing, bugs etc.)
Inject code into engine from different files (like deltaTime)
It is now defined and easily testable
Core engine just has to read data, only care about its own logic

SEPARATE THESE INTO FILES RATHER THAN HEADERS IN ENGINE
Eg. Player, torch, physics, resources, game economy, score
	  resource systems (use/gain)
This can be injected later
Once tests and basic implementation done the team can work on making it
more sophisticated/extending feature later

GOOD TESTS
A test looks like very simple fragment of code  (no more than 10 ines)
- One line to setup
- One line to call into function
- One line to check result
Should be very short
Easy to read/understand
These tests should survive any code changes
*E.g.*
*Game should load all phases (gameplay - render)
When jump should land on the ground (gravity test)*

BAD TESTS
*Something that does -> Go to file pull in config file, change files to be this, check values, change values etc.*
Messy, overcomplicated, written after not before
