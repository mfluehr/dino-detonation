"use strict";

const Util = require("./util"),
      Bomb = require("./bomb"),
      //// Pickup = require("./pickup"),
      Tile = require("./tile");


const tileWidth = 80;
const tileHeight = 80;

const maps = {
  testLevel: {
    tiles: [
      [0,0,0,0,0,0,9,0,0,0,0,0,0],
      [0,0,0,0,0,0,9,0,0,0,0,0,0],
      [0,0,0,9,0,0,9,0,0,0,0,0,0],
      [0,9,9,9,0,0,9,0,0,0,0,0,0],
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


const Level = ({
  name,
  room
}) => {
  const self = {
    get reset () { return reset; },
    get addBomb () { return addBomb; },
    get addUser () { return resetUser; },
    get deleteUser () { return deleteUser; }
  };


  let map = initMap(name),
      avatars = initAvatars(room.users),
      bombs = Util.Array2(level.width, level.height),
      pickups = Util.Array2(level.width, level.height);


  const reset = (data) => {
    ({name} = {...{name}, ...data});
  };

  const addBomb = (userId, x, y) => {
    x = tileX(x);
    y = tileY(y);

    bomb = Bomb({
      level: self,
      x, y,
      userId
    });

    bombs[x][y] = bomb;

    return true;
  };

  const addPickup = (x, y) => {
    ////
  };

  const deleteUser = (userId) => {
    const avatar = room.users.get(userId).avatar;

    avatar.kill();
    avatars.delete(avatar);  // TODO: only delete once animation completed
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

  const initMap = (name) => {
    const map = maps[name];

    return map;
  };

  const resetAvatar = (avatar) => {
    avatar.reset();
    avatar.playerNumber = freePlayerNumber();
    avatar.x = map.homes[avatar.playerNumber].x;
    avatar.y = map.homes[avatar.playerNumber].y;
  };

  const tileX = (x) => {
    return Math.round(x / tileWidth);
  };

  const tileY = (y) => {
    return Math.round(y / tileHeight);
  };


  return self;
};

module.exports = Level;
