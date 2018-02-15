"use strict";


const User = (properties = {}, lobby) => {
  const self = new Proxy(properties, {
    set: (obj, prop, val) => {
      obj[prop] = val;
      lobby.showUserUpdate(self, prop);
      return true;
    }
  });

  return self;
};


module.exports = User;
