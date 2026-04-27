//======================================
// UNIT TESTS - ROOM SYSTEM
//======================================
/*
Tests for roomSystem.js — verifies room loading, exit transitions,
player spawn, and state exposure via getters.
*/

import { jest } from '@jest/globals';

jest.unstable_mockModule('../config.js', () => ({
  CANVAS: { TILE_SIZE: 16 },
  TIME: { fixedDeltaTime: 1 / 60 },
}));

const { createRoomSystem } = await import('../systems/roomSystem.js');

describe('RoomSystem', () => {
  let player;
  let onRoomLoaded;
  let onWin;

  function makePlayer(overrides = {}) {
    return {
      position: { x: 100, y: 100 },
      setCurrentPosition: jest.fn((x, y) => { player.position.x = x; player.position.y = y; }),
      w: 32,
      h: 16,
      ...overrides,
    };
  }

  function makeRoomConfig(overrides = {}) {
    return {
      platforms: [
        { x: 0, y: 200, w: 320, h: 16 },
      ],
      hazards: [],
      collectables: [],
      enemies: [],
      triggers: [],
      exits: [],
      entities: [],
      foreground: [],
      spawnPoints: [{ x: 100, y: 180, spawnId: 'default' }],
      playerStart: { x: 100, y: 180 },
      background: null,
      platformColor: '#5a6e82',
      ...overrides,
    };
  }

  beforeEach(() => {
    player = makePlayer();
    onRoomLoaded = jest.fn();
    onWin = jest.fn();
  });

  //======================================
  // INITIALIZATION
  //======================================

  describe('initialization', () => {
    it('loads the initial room on construction', () => {
      const roomData = { roomA: makeRoomConfig() };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player, onRoomLoaded });
      expect(rs.getCurrentRoom()).toBe('roomA');
    });

    it('calls onRoomLoaded callback when initial room loads', () => {
      const roomData = { roomA: makeRoomConfig() };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player, onRoomLoaded });
      expect(onRoomLoaded).toHaveBeenCalled();
    });

    it('starts with null current room if no initialRoom', () => {
      const rs = createRoomSystem({ roomData: {}, player });
      expect(rs.getCurrentRoom()).toBeNull();
    });
  });

  //======================================
  // GO TO ROOM
  //======================================

  describe('goToRoom', () => {
    it('changes current room when goToRoom is called', () => {
      const roomData = {
        roomA: makeRoomConfig(),
        roomB: makeRoomConfig({ id: 'roomB' }),
      };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      rs.goToRoom('roomB');
      expect(rs.getCurrentRoom()).toBe('roomB');
    });

    it('updates player position to new room spawn point', () => {
      const roomData = {
        roomA: makeRoomConfig({ spawnPoints: [{ x: 100, y: 180, spawnId: 'default' }] }),
        roomB: makeRoomConfig({ spawnPoints: [{ x: 300, y: 150, spawnId: 'default' }] }),
      };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      rs.goToRoom('roomB');
      expect(player.position.x).toBe(300);
      expect(player.position.y).toBe(150);
    });

    it('warns and does nothing for unknown room', () => {
      const roomData = { roomA: makeRoomConfig() };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      rs.goToRoom('nonexistent');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('uses specific spawnId when provided', () => {
      const roomData = {
        roomA: makeRoomConfig(),
        roomB: makeRoomConfig({
          spawnPoints: [
            { x: 50, y: 50, spawnId: 'alt' },
            { x: 300, y: 150, spawnId: 'default' },
          ],
        }),
      };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      rs.goToRoom('roomB', { spawnId: 'alt' });
      expect(player.position.x).toBe(50);
    });
  });

  //======================================
  // STATE GETTERS
  //======================================

  describe('state getters', () => {
    it('getPlatforms returns room platforms', () => {
      const platforms = [{ x: 0, y: 200, w: 320, h: 16 }];
      const roomData = { roomA: makeRoomConfig({ platforms }) };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      expect(rs.getPlatforms().length).toBeGreaterThan(0);
    });

    it('getHazards returns room hazards', () => {
      const hazards = [{ x: 150, y: 180, w: 16, h: 16 }];
      const roomData = { roomA: makeRoomConfig({ hazards }) };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      expect(rs.getHazards().length).toBe(1);
    });

    it('getCollectables returns room collectables', () => {
      const collectables = [{ x: 120, y: 160, w: 16, h: 16 }];
      const roomData = { roomA: makeRoomConfig({ collectables }) };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      expect(rs.getCollectables().length).toBe(1);
    });

    it('getEnemies returns room enemies', () => {
      const enemies = [{ x: 200, y: 150, w: 24, h: 24 }];
      const roomData = { roomA: makeRoomConfig({ enemies }) };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      expect(rs.getEnemies().length).toBe(1);
    });

    it('getRoomState returns full state object', () => {
      const roomData = { roomA: makeRoomConfig() };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      const state = rs.getRoomState();
      expect(state).toHaveProperty('platforms');
      expect(state).toHaveProperty('hazards');
      expect(state).toHaveProperty('currentRoom', 'roomA');
    });

    it('getBackground returns room background', () => {
      const roomData = { roomA: makeRoomConfig({ background: { color: '#021B3A' } }) };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      expect(rs.getBackground()).toBeTruthy();
    });

    it('getTileSize returns tile dimensions', () => {
      const roomData = { roomA: makeRoomConfig() };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      const tileSize = rs.getTileSize();
      expect(tileSize).toHaveProperty('tileWidth');
      expect(tileSize).toHaveProperty('tileHeight');
    });
  });

  //======================================
  // EXIT TRANSITIONS
  //======================================

  describe('exit transitions', () => {
    it('triggers room change when player overlaps an exit', () => {
      const exit = { x: 200, y: 180, w: 16, h: 32, properties: { targetRoom: 'roomB' } };
      const roomData = {
        roomA: makeRoomConfig({
          triggers: [exit],
          exits: [exit],
          spawnPoints: [{ x: 50, y: 180, spawnId: 'default' }],
        }),
        roomB: makeRoomConfig({
          id: 'roomB',
          spawnPoints: [{ x: 50, y: 180, spawnId: 'default' }],
        }),
      };
      const rs = createRoomSystem({
        initialRoom: 'roomA',
        roomData,
        player,
        getAllowedRooms: () => ['roomA', 'roomB'],
        getGameVersion: () => 'full',
      });
      // Move player to exit position
      player.position.x = 200;
      player.position.y = 180;
      rs.update(); // Triggers exit
      expect(rs.getCurrentRoom()).toBe('roomB');
    });

    it('calls onWin when exit has isWin = true', () => {
      const exit = { x: 200, y: 180, w: 16, h: 32, properties: { isWin: true } };
      const roomData = {
        roomA: makeRoomConfig({ triggers: [exit], exits: [exit] }),
      };
      const rs = createRoomSystem({
        initialRoom: 'roomA',
        roomData,
        player,
        onWin,
      });
      player.position.x = 200;
      player.position.y = 180;
      rs.update();
      expect(onWin).toHaveBeenCalled();
    });

    it('does not transition during exit cooldown', () => {
      const exit = { x: 200, y: 180, w: 16, h: 32, properties: { targetRoom: 'roomB' } };
      const roomData = {
        roomA: makeRoomConfig({ triggers: [exit], exits: [exit], spawnPoints: [{ x: 50, y: 180, spawnId: 'default' }] }),
        roomB: makeRoomConfig({ id: 'roomB', spawnPoints: [{ x: 50, y: 180, spawnId: 'default' }] }),
      };
      const rs = createRoomSystem({
        initialRoom: 'roomA',
        roomData,
        player,
        getAllowedRooms: () => ['roomA', 'roomB'],
      });
      player.position.x = 200;
      rs.update(); // Transitions to roomB
      const roomAfterFirst = rs.getCurrentRoom();
      player.position.x = 200; // Still at exit in new room
      rs.update(); // Should not transition again
      expect(rs.getCurrentRoom()).toBe(roomAfterFirst);
    });
  });

  //======================================
  // TILEDS JSON NORMALIZATION
  //======================================

  describe('Tiled JSON room normalization', () => {
    it('parses a minimal Tiled-format room', () => {
      const tiledRoom = {
        width: 20,
        height: 15,
        tilewidth: 16,
        tileheight: 16,
        layers: [],
      };
      const roomData = { tiledRoom };
      const rs = createRoomSystem({ initialRoom: 'tiledRoom', roomData, player });
      expect(rs.getCurrentRoom()).toBe('tiledRoom');
    });
  });

  //======================================
  // EDGE CASES
  //======================================

  describe('edge cases', () => {
    it('handles missing player gracefully', () => {
      const roomData = { roomA: makeRoomConfig() };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player: null });
      expect(() => rs.update()).not.toThrow();
    });

    it('handles room with no spawn points', () => {
      const roomData = {
        roomA: makeRoomConfig({ spawnPoints: [], playerStart: null }),
      };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      expect(() => rs.goToRoom('roomA')).not.toThrow();
    });

    it('getSpawnPoints returns spawn points array', () => {
      const spawnPoints = [{ x: 100, y: 180, spawnId: 'default' }];
      const roomData = { roomA: makeRoomConfig({ spawnPoints }) };
      const rs = createRoomSystem({ initialRoom: 'roomA', roomData, player });
      const spawns = rs.getSpawnPoints();
      expect(Array.isArray(spawns)).toBe(true);
    });
  });
});
