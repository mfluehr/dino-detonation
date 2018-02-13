"use strict";

const PersonalAvatar = require("./personal-avatar");


const PersonalUser = (app, lobby) => {
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

    properties.avatar = PersonalAvatar(app, p);

    return p;
  })();


  return self;
};


module.exports = PersonalUser;
