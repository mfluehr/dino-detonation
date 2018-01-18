"use strict";

const Util = require("./util");


const Avatar = (socket, user) => {
  const reset = () => {
    const avatarOptions = user.room.levelOptions.avatars,
          bombOptions = user.room.levelOptions.bombs;

    Object.assign(self, avatarOptions, {
      bombRange: bombOptions.range,
      bombSpeed: bombOptions.speed,
      bombTimer: bombOptions.timer
    });

    self.bombsUsed = 0;
    self.capacity = self.minCapacity;
    self.face = Util.DIRECTIONS.bottom;
    self.speed = self.minSpeed;
  };

  const dropBomb = () => {
    //// self.room.level.addBomb(user.id);
    console.log("Drop");

    // if (self.bombsUsed < self.capacity) {
    //   if (user.room.level.addBomb(user.id, x, y)) {
    //     self.bombsUsed ++;
    //   }
    // }
  };

  const explodeAllBombs = () => {
    if (self.pickups.dynamite) {
      //
    }
  };

  const halt = () => {};

  const kill = () => {};

  const leaveRoom = () => {};

  const listen = () => {
    socket.on("dropBomb", () => {
      dropBomb();
      ////this.broadcast("dropBomb");
    });

    socket.on("explodeAllBombs", () => {
      explodeAllBombs();
    });

    socket.on("halt", () => {
      halt();
    });

    socket.on("move", (angle) => {
      // TODO: sanitize angle
      move(angle);
    });
  };

  const move = (angle) => {
    //// socket.broadcast("move", angle);
  };


  const self = (() => {
    const properties = Object.seal({
      pickups: new Set(),
      playerNumber: 0,
      x: 0,
      y: 0,
      bombRange: 0,
        bombSpeed: 0,
        bombTimer: 0,
        bombsUsed: 0,
      capacity: 0,
        minCapacity: 0,
        maxCapacity: 0,
      face: Util.DIRECTIONS.bottom,
      speed: 0,
        minSpeed: 0,
        maxSpeed: 0,
      stats: {
        blocksDestroyed: 0,
        bombsDropped: 0,
        deaths: 0,
        distWalked: 0,
        kills: 0,
        pickupsCollected: 0,
        suicides: 0,
        survivalTime: 0
      },

      get reset () { return reset; },
      get leaveRoom () { return reset; }
    });

    const p = properties;

    return p;
  })();


  listen();


  return self;
};

module.exports = Avatar;
