"use strict";

const Util = require("./util"),
      Bomb = require("./bomb"),
      //// Pickup = require("./pickup"),
      Tile = require("./tile");


const maps = {
  testLevel: {
    tiles: [
      [0,0,0,0,0,0,9,0,0,0,0,0,0],
      [0,0,0,0,0,0,9,0,0,0,0,0,0],
      [0,0,0,9,0,0,9,0,0,0,0,0,0],
      [0,9,9,9,0,0,9,0,0,0,9,9,0],
      [0,0,0,0,0,9,9,9,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,9,0,0,0,0,9,9,9,9],
      [0,0,0,0,9,0,0,0,0,0,9,9,9],
      [0,0,0,0,9,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,9,9,9,0,0,0,0],
      [0,0,0,0,0,0,9,9,9,0,0,0,0],
      [0,0,0,0,0,9,9,9,0,0,0,0,0],
      [0,0,0,0,0,9,9,9,0,0,0,0,0]
    ],
    homes: {
      1: [0, 0],
      2: [13, 13],
      3: [13, 0],
      4: [0, 13]
    }
  }
};


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
    // avatars.delete(avatar);  // TODO: only delete once animation completed
  };

  const freePlayerNumber = () => {
    const usedNums = new Set();
    let num = 0;

    avatars.forEach((avatar) => {
      usedNums.add(avatar.playerNumber);
    });

    for (let i = 1; i < map.homes.length; i ++) {
      if (!usedNums.has(i)) {
        num = i;
        return;
      }
    }

    return num;
  };

  const initAvatars = (users) => {
    const avatars = new Set();

    users.forEach((user, userId) => {
      resetAvatar(user.avatar);
      avatars.add(user.avatar);
    });

    return avatars;
  };

  const load = (name) => {
    // Object.assign(self, maps[name]);
    const map = maps[name];


    self.width = map.tiles.length;
    self.height = map.tiles[0].length;

    //// initAvatars();
    // self.bombs = Util.Array2(self.width, self.height);
    // self.pickups = Util.Array2(self.width, self.height);
    self.tiles = Util.Array2(self.width, self.height);

    map.tiles.forEach((row, y) => {
      row.forEach((col, x) => {
        self.tiles[x][y] = Tile();
      });
    });
  };

  const resetAvatar = (avatar) => {
    avatar.reset();
    avatar.playerNumber = freePlayerNumber();
    avatar.x = self.homes[avatar.playerNumber].x;
    avatar.y = self.homes[avatar.playerNumber].y;
  };

  const tileX = (x) => {
    return Math.round(x / self.tileWidth);
  };

  const tileY = (y) => {
    return Math.round(y / self.tileHeight);
  };


  const properties = Object.seal({
    avatars: new Set(),
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
        //// id: self.id
      };
    }
  });

  const self = properties;


  load(options.name);


  return self;
};

module.exports = Level;
