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

const LocalUser = (base, room) => {
  const self = (() => {
    const properties = Object.assign({}, base);

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        room.showUserUpdate(p, prop);
        return true;
      }
    });

    properties.avatar = LocalAvatar(p);

    return p;
  })();

  return self;
};

const PersonalUser = (lobby) => {
  const joinRoom = (id) => {
    app.socket.emit("joinRoom", id);
  };

  const load = (id) => {
    self.id = id;
  };

  const startGame = () => {
    app.socket.emit("startGame");
  };


  const self = (() => {
    const editable = new Set(["email", "name"]);

    const properties = {
      get createRoom () { return createRoom; },
      get joinRoom () { return joinRoom; },
      get load () { return load; },
      get login () { return login; },
      get startGame () { return startGame; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (editable.has(prop)) {
          app.socket.emit("syncUser", { prop, val });
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
