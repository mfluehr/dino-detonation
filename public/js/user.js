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
  const load = (base) => {
    properties.base = base;
  };


  const editable = new Set(["email", "name"]);

  const properties = {
    base: {},
    room: PersonalRoom(lobby),
    socket: lobby.socket
  };

  const self = new Proxy(properties, {
    set: (obj, prop, val) => {
      if (editable.has(prop)) {
        self.socket.emit("updateUser", { prop, val });
        return true;
      }

      return false;
    }
  });


  self.socket.on("loadLocalUser", (id) => {
    //// const el = els.userList.querySelector(`[data-id="${id}"]`);
    // el.classList.add("personal");
    load(lobby.users.get(id));
    app.view = "lobby";
  });


  return self;
};
