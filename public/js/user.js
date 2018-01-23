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

const LocalUser = (base) => {
  const self = (() => {
    const properties = Object.assign({}, base);

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        app.user.room.showUserUpdate(p, prop);
        return true;
      }
    });

    properties.avatar = LocalAvatar(p);

    return p;
  })();

  return self;
};

const PersonalUser = (lobby) => {
  const createRoom = () => {
    const roomName = lobby.els.roomName.value;
    self.socket.emit("addRoom", roomName);
  };

  const joinRoom = (id) => {
    self.socket.emit("joinRoom", id);
  };

  const load = (base) => {
    self.base = base;
    self.id = base.id;
  };

  const login = () => {
    self.name = lobby.els.userName.value;
  };

  const startGame = () => {
    self.socket.emit("startGame");
  };


  const self = (() => {
    const editable = new Set(["email", "name"]);

    const properties = {
      socket: lobby.socket,

      get createRoom () { return createRoom; },
      get joinRoom () { return joinRoom; },
      get load () { return load; },
      get login () { return login; },
      get startGame () { return startGame; }
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
