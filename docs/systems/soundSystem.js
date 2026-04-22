/*
========================================
SYSTEM: SOUND SYSTEM
AUTHOR: Monal Gupta
DESCRIPTION:
- Manages all sound effects and music in the game.
==========================================
*/

export function createSoundSystem() {
    const sounds = {};
    let masterVolume = 0.8;

    return {
        preload() {
            sounds.sonarPing = loadSound('assets/sounds/sonarPing.wav');
            sounds.missileFired = loadSound('assets/sounds/missileFired.wav');
            sounds.torchToggle = loadSound('assets/sounds/torchToggle_single.wav');
            // sounds.crabHit = loadSound('assets/sounds/crabHit.wav');
            // sounds.jellyfishHit = loadSound('assets/sounds/jellyfishHit.wav');
            // sounds.piranhaHit = loadSound('assets/sounds/piranhaHit.wav');
            sounds.playerHit = loadSound('assets/sounds/playerHit1.wav');
        },

      setMasterVolume(zeroToHundred) {
        masterVolume = zeroToHundred / 100;
      },

        play(key, volume = 1.0) {
      const s = sounds[key];
      if (s && s.isLoaded()) {
        s.setVolume(volume*masterVolume);
        s.play();
      } else {
        console.warn(`[soundSystem] Sound not ready: "${key}"`);
      }
    }

  };
}