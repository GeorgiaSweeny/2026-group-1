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

    return {
        preload() {
            sounds.sonarPing = loadSound('assets/sounds/sonarPing.wav');
        },

        play(key, volume = 1.0) {
      const s = sounds[key];
      if (s && s.isLoaded()) {
        s.setVolume(volume);
        s.play();
      } else {
        console.warn(`[soundSystem] Sound not ready: "${key}"`);
      }
    }

  };
}