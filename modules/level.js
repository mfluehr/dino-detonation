"use strict";

const Util = require("./util"),
      Bomb = require("./bomb"),
      //// Pickup = require("./pickup"),
      Tile = require("./tile");


const Level = (options, room) => {
  const addBomb = (ownerId, x, y) => {
    x = tileX(x);
    y = tileY(y);

    bomb = Bomb({
      level: self,
      x, y,
      ownerId
    });

    bombs[x][y] = bomb;

    return true;
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

    self.width = map.tiles.length;
    self.height = map.tiles[0].length;
    self.homes = [...map.homes];
    self.bombs = [];
    self.pickups = [];

    initTiles();
    initAvatars();
  };

  const tileX = (x) => {
    return Math.round(x / self.tileWidth);
  };

  const tileY = (y) => {
    return Math.round(y / self.tileHeight);
  };


  const self = (() => {
    const properties = Object.seal({
      bombs: [],
      homes: [],
      pickups: [],
      room,
      tiles: [],
      tileWidth: 80,
      tileHeight: 80,
      width: 0,
      height: 0,

      get addBomb () { return addBomb; },
      get addUser () { return resetUser; },
      get deleteUser () { return deleteUser; },
      get load () { return load; },

      get roomData () {
        return {
          //// id: p.id
        };
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
