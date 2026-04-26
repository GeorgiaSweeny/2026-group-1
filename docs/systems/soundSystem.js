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
      sounds.introMusic = loadSound('assets/sounds/intro1.mp3');
      sounds.buttonClick = loadSound('assets/sounds/buttonClick.wav');
      sounds.waterSplash = loadSound('assets/sounds/waterSplash.mp3');
      sounds.gamebg1 = loadSound('assets/sounds/gamebg1.wav');
    },

    setMasterVolume(zeroToHundred) {
      masterVolume = zeroToHundred / 100;
    },

    play(key, volume = 1.0) {
      const s = sounds[key];
      if (s && s.isLoaded()) {
        s.setVolume(volume * masterVolume);
        s.play();
      } else {
        console.warn(`[soundSystem] Sound not ready: "${key}"`);
      }
    },

    loop(key, volume = 1.0) {
      const s = sounds[key];
      if (s && s.isLoaded() && !s.isPlaying()) {
        s.setVolume(volume * masterVolume);
        s.loop();
      }
    },

    stop(key) {
      const s = sounds[key];
      if (s && s.isPlaying()) {
        s.stop();
      }
    },

    isPlaying(key) {
      return sounds[key]?.isPlaying() ?? false;
    },

  };
}