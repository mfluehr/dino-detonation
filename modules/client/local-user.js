"use strict";

const LocalAvatar = require("./local-avatar");


const LocalUser = (app, base, room) => {
  const self = (() => {
    const properties = Object.assign({}, base);

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        room.showUserUpdate(p, prop);
        return true;
      }
    });

    properties.avatar = LocalAvatar(app, p);

    return p;
  })();

  return self;
};


module.exports = LocalUser;
