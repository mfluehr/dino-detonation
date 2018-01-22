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

const LocalUser = (base, lobby) => {
  const self = (() => {
    const properties = Object.assign({}, base);

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        lobby.personalUser.room.showUserUpdate(p, prop);
        return true;
      }
    });

    properties.avatar = LocalAvatar(p);

    return p;
  })();

  return self;
};

const PersonalUser = (lobby) => {
  const load = (base) => {
    self.base = base;
    self.id = base.id;
  };


  const self = (() => {
    const editable = new Set(["email", "name"]);

    const properties = {
      room: LocalRoom(lobby),
      socket: lobby.socket,

      get load () { return load; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (editable.has(prop)) {
          p.socket.emit("updateUser", { prop, val });
          return true;
        }

        obj[prop] = val;
        return true;
      }
    });

    properties.avatar = PersonalAvatar(p);

    return p;
  })();


  return self;
};
