"use strict";

const sanitizer = require("./sanitizer"),
      util = require("./util");


const Avatar = (socket, user) => {
  const dropBomb = () => {
    console.log("Drop");

    if (self.bombsUsed < self.capacity) {
      // const x = col * tileSize,
      //       y = row * tileSize;
      // if (self.user.room.level.loadBomb(self.user.id, x, y)) {
      //   self.bombsUsed ++;
      // }
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
    self.socket.on("syncAvatar", sync);
    self.socket.on("syncLevel", syncLevel);
  };

  const spawn = (level) => {
    const home = level.homes.shift(),
          avatarOptions = level.room.levelOptions.avatars,
          bombOptions = level.room.levelOptions.bombs;

    Object.assign(self, avatarOptions, {
      x: home[0],
      y: home[1],
      bombRange: bombOptions.range,
        bombSpeed: bombOptions.speedLimit,
        bombTimer: bombOptions.timer,
        bombsUsed: 0,
      capacity: avatarOptions.minCapacity,
      speed: 0,
      speedLimit: avatarOptions.minSpeedLimit
    });

    self.pickups.clear();
  };

  const sync = (data) => {
    util.syncObject(self, avatarSanitizer, data);
  };

  const syncLevel = (data) => {
    ////console.log(data);
    // self.user.room.level.sync(data);
  };

  const tick = (ms) => {
    self.x += Math.cos(self.rad) * self.speed * ms;
    self.y += Math.sin(self.rad) * self.speed * ms;
  };


  const avatarSanitizer = {
    rad: (rad) => {
      rad = sanitizer.toFloat(rad);
      rad = util.toInterval(rad, Math.PI * 1/2);
      return rad;
    },
    speed: (ratio) => {
      ratio = sanitizer.toFloat(ratio);
      ratio = Math.abs(ratio);
      ratio = Math.min(self.speedLimit, ratio);
      return ratio;
    }
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
      level: undefined,
      pickups: new Set(),
      rad: Math.PI * 1/2,
      socket,
      speed: 0,
        speedLimit: 0,
        minSpeedLimit: 0,
        maxSpeedLimit: 0,
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
      get spawn () { return spawn; },
      get tick () { return tick; },

      get localData () {
        return {
          props: {
            x: p.x,
            y: p.y,
            capacity: p.capacity,
            rad: p.rad,
            speed: p.speed,
              speedLimit: p.speedLimit
          }
        };
      }
    });

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (obj[prop] !== val) {
          const data = {
            id: p.user.id,
            props: {
              [prop]: val
            }
          };

          p.user.room.clients.emit("syncAvatar", data);
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
