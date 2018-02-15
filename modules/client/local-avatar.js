"use strict";


const LocalAvatar = (app, user) => {
  const sync = (data) => {
    Object.assign(self, data.props);
  };

  const tick = (ms) => {
    self.x += Math.cos(self.rad) * self.speed * ms;
    self.y += Math.sin(self.rad) * self.speed * ms;
  };


  const self = (() => {
    const properties = {
      socket: app.socket,
      user,

      get sync () { return sync; },
      get tick () { return tick; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        return true;
      }
    });

    return p;
  })();


  return self;
};


module.exports = LocalAvatar;
