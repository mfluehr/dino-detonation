"use strict";

const sanitizer = require("./sanitizer"),
      util = require("./util");


const Avatar = (socket, user) => {
  const dropBomb = () => {
    //// self.room.level.addBomb(self.user.id);
    console.log("Drop");

    if (self.bombsUsed < self.capacity) {
    //   if (self.user.room.level.addBomb(self.user.id, x, y)) {
    //     self.bombsUsed ++;
    //   }
    }
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
    self.socket.on("dropBomb", dropBomb);
    self.socket.on("explodeAllBombs", explodeAllBombs);
    self.socket.on("pauseGame", pauseGame);
    self.socket.on("updateAvatar", update);
  };

  const move = (rad) => {
    ////
    rad = util.toInterval(rad, Math.PI * 1/2);
  };

  const pauseGame = (paused) => {
    console.log("PAUSE!", paused);
    // self.user.level.pause();
  };

  const spawn = (level) => {
    const room = level.room,
          home = level.homes.shift(),
          avatarOptions = room.levelOptions.avatars,
          bombOptions = room.levelOptions.bombs;

    Object.assign(self, avatarOptions, {
      x: home[0],
      y: home[1],
      bombRange: bombOptions.range,
        bombSpeed: bombOptions.speed,
        bombTimer: bombOptions.timer,
        bombsUsed: 0,
      capacity: avatarOptions.minCapacity,
      speed: avatarOptions.minSpeed
    });

    self.pickups.clear();
  };

  const update = (data) => {
    util.updateObject(self, avatarSanitizer, data);
  };


  const avatarSanitizer = {
    paused: (paused) => sanitizer.toBoolean(paused),
    rad: (rad) => sanitizer.toFloat(rad)
  };


  const self = (() => {
    const properties = Object.seal({
      x: 0,
      y: 0,
      bombRange: 0,
        bombSpeed: 0,
        bombTimer: 0,
        bombsUsed: 0,
      capacity: 0,
        minCapacity: 0,
        maxCapacity: 0,
      pickups: new Set(),
      rad: Math.PI * 1/2,
      socket,
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
      user,

      get leaveRoom () { return leaveRoom; },
      get spawn () { return spawn; }
    });

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (obj[prop] !== val) {
          if (prop === "paused") {
            pauseGame(val);
          }
          else if (prop === "rad") {
            console.log(prop, val);
            //// move();
          }
          else {
            const data = {
              id: p.id,
              props: {
                [prop]: val
              }
            };

            p.user.room.clients.emit("updateAvatar", data);
          }

          obj[prop] = val;
        }

        return true;
      }
    });

    return p;
  })();


  listen();


  return self;
};

module.exports = Avatar;
