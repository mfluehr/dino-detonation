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
    self.timer.setInterval(tick, [self.timer], ".05s");
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

  const sync = (data) => {
    util.syncObject(self, levelSanitizer, data);
  };

  const tick = ({ intervalTime: delta }) => {
    const ms = delta / 1000000;

    if (!self.paused) {
      self.room.users.forEach((user) => user.avatar.tick(ms));
    }
  };

  const unload = () => {
    self.timer.clearInterval();
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

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (obj[prop] !== val) {
          const data = {
            id: p.id,
            props: {
              [prop]: val
            }
          };

          //// p.user.room.clients.emit("syncLevel", data);
          obj[prop] = val;
        }

        return true;
      }
    });

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
