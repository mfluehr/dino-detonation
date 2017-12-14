"use strict";

const Util = require("./util");


const Avatar = (socket, user) => {
  const pickups = new Set();

  let playerNumber = 0,
      x = 0,
      y = 0,
      bombRange = 0,
      bombSpeed = 0,
      bombTimer = 0,
      bombsUsed = 0,
      capacity = 0,
      minCapacity = 0,
      maxCapacity = 0,
      face = Util.DIRECTIONS.bottom,
      speed = 0,
      minSpeed = 0,
      maxSpeed = 0;

  const stats = {
    blocksDestroyed: 0,
    bombsDropped: 0,
    deaths: 0,
    distWalked: 0,
    kills: 0,
    pickupsCollected: 0,
    suicides: 0,
    survivalTime: 0
  };


  const reset = () => {
    const avatarDefaults = user.room.roomOptions.avatars,
          bombDefaults = user.room.roomOptions.bombs;

    ({face, minCapacity, maxCapacity, minSpeed, maxSpeed} = {...avatarDefaults});
    ({range:bombRange, speed:bombSpeed, timer:bombTimer} = {...bombDefaults});

    bombsUsed = 0;
    capacity = minCapacity;
    face = DIRECTIONS.bottom;
    speed = minSpeed;
  };

  const dropBomb = () => {
    if (bombsUsed < capacity) {
      if (user.room.level.addBomb(user.userId, x, y)) {
        bombsUsed ++;
      }
    }
  };

  const explodeAllBombs = () => {
    if (bonuses.dynamite) {
      //
    }
  };

  const halt = () => {};

  const kill = () => {};

  const move = (angle) => {
    ////socket.broadcast("move", angle);
  };

  const quit = () => {};


  socket.on("dropBomb", function () {
    dropBomb();
    ////this.broadcast("dropBomb");
  });

  socket.on("explodeAllBombs", function () {
    explodeAllBombs();
  });

  socket.on("halt", function () {
    halt();
  });

  socket.on("move", function (angle) {
    // TODO: sanitize angle
    move(angle);
  });


  return {
    reset,
    quit
  };
};

module.exports = Avatar;
