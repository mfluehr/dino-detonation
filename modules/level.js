"use strict";

const Bomb = require("./bomb"),
      NanoTimer = require('nanotimer'),
      //// Pickup = require("./pickup"),
      Tile = require("./tile"),
      util = require("./util");


const Level = (options, room) => {
  const addBomb = (ownerId, x, y) => {
    const bomb = Bomb({
      level: self,
      x: roundToTileX(x),
      y: roundToTileY(y),
      ownerId
    });

    if (tileOpenAt(x, y)) {
      self.bombs.push(bomb);
      return true;
    }

    return false;
  };

  const addPickup = (x, y) => {
    ////
  };

  const deleteUser = (id) => {
    //// const avatar = self.room.users.get(id).avatar;
    //
    // avatar.kill();
    // users.avatars.delete(avatar);  // TODO: only delete once animation completed
  };

  const gameLoop = () => {
    const tick = ({ intervalTime: delta }) => {
      const s = delta / 1000000000;

      if (!self.paused) {
        console.log(s);
        self.room.users.forEach((user) => user.avatar.move(s));
      }
    };


    self.timer.setInterval(tick, [self.timer], "1s");
  };

  const load = (name) => {
    const initAvatars = () => {
      self.room.users.forEach((user, userId) => {
        user.avatar.spawn(self);
      });
    };

    const initTiles = () => {
      self.tiles = map.tiles.map((row) => {
        return row.map((val) => Tile(val));
      });
    };


    const map = maps[name];

    self.numCols = map.tiles.length;
    self.numRows = map.tiles[0].length;
    self.homes = [...map.homes];
    self.bombs = [];
    self.pickups = [];

    initTiles();
    initAvatars();
    gameLoop();
  };

  const nearestCol = (x) => {
    return Math.toInterval(x / self.tileWidth);
  };

  const nearestRow = (y) => {
    return Math.toInterval(y / self.tileHeight);
  };

  const roundToTileX = (x) => {
    return nearestCol(x) * self.tileWidth;
  };

  const roundToTileY = (y) => {
    return nearestRow(y) * self.tileHeight;
  };

  const unload = () => {
    self.timer.clearInterval();
  };

  const update = (data) => {
    util.updateObject(self, levelSanitizer, data);
  };


  const levelSanitizer = {
    paused: (paused) => sanitizer.toBoolean(paused)
  };


  const self = (() => {
    const properties = Object.seal({
      bombs: [],
      homes: [],
      numCols: 0,
      numRows: 0,
      paused: false,
      pickups: [],
      room,
      tiles: [],
      tileWidth: 80,
      tileHeight: 80,
      timer: new NanoTimer(),

      get addBomb () { return addBomb; },
      get addUser () { return resetUser; },
      get deleteUser () { return deleteUser; },
      get load () { return load; },
      get unload () { return unload; },

      get localData () {
        return {
          roomId: p.room.id,
          props: {
            numCols: p.numCols,
            numRows: p.numRows,
            paused: p.paused,
            tileWidth: p.tileWidth,
            tileHeight: p.tileHeight
          },
          tiles: p.tileData
        };
      },
      get tileData () {
        const tileData = [];
        p.tiles.forEach((tile, tileId) => {
          tileData.push(tile.localData);
        });
        return tileData;
      }
    });

    const p = properties;

    return p;
  })();


  load(options.name);


  return self;
};


const maps = {
  testLevel: {
    tiles: [
      [0,0,0,0,0,0,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,0,0,0,0,0,0],
      [0,0,0,1,0,0,1,0,0,0,0,0,0],
      [0,1,1,1,0,0,1,0,0,0,1,1,0],
      [0,0,0,0,0,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,1,0,0,0,0,1,1,1,1],
      [0,0,0,0,1,0,0,0,0,0,1,1,1],
      [0,0,0,0,1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,0,0,0,0],
      [0,0,0,0,0,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,0,0,0,0,0]
    ],
    homes: [
      [0, 0],
      [13, 13],
      [13, 0],
      [0, 13]
    ]
  }
};


module.exports = Level;
