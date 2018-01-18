"use strict";


const User = (properties, lobby) => {
  properties.lobby = lobby;

  const self = new Proxy(properties, {
    set: (obj, prop, val) => {
      obj[prop] = val;
      self.lobby.updateUser(self, prop);
      return true;
    }
  });

  return self;
};

const LocalUser = (base, lobby) => {
  const self = new Proxy(base, {
    set: (obj, prop, val) => {
      obj[prop] = val;
      self.lobby.personalUser.room.updateUser(self, prop);
      return true;
    }
  });

  return self;
};

const PersonalUser = (lobby) => {
  const listen = () => {
    self.socket.on("loadPersonalUser", (id) => {
      load(lobby.users.get(id));
      app.view = "lobby";
    });
  };

  const load = (base) => {
    self.base = base;
  };


  const self = (() => {
    const editable = new Set(["email", "name"]);

    const properties = {
      base: {},
      room: LocalRoom(lobby),
      socket: lobby.socket
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

    return p;
  })();


  listen();


  return self;
};
