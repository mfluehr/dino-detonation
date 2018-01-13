"use strict";


const User = (properties, lobby) => {
  const self = new Proxy(properties, {
    get: (obj, prop) => {
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;

      console.log("down", val);
      lobby.updateUser(self, prop);
      // lobby.personalUser.room.updateUser(self, prop);

      return true;
    }
  });

  return self;
};

const PersonalUser = (lobby) => {
  const load = (base) => {
    properties.base = base;
  };


  const editable = new Set(["email", "name"]);

  const properties = {
    base: {},
    room: PersonalRoom(lobby),

    get load () { return load; }
  };

  const self = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop in obj.base) {
        return obj.base[prop];
      }

      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (editable.has(prop)) {
        lobby.socket.emit("updateUser", { prop, val });
        return true;
      }

      return false;
    }
  });


  return self;
};
