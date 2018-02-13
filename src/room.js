"use strict";


const Room = (properties, lobby) => {
  const self = new Proxy(properties, {
    set: (obj, prop, val) => {
      obj[prop] = val;
      lobby.showRoomUpdate(self, prop);
      return true;
    }
  });

  return self;
};


module.exports = Room;
