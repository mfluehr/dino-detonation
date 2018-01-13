"use strict";


const Room = (properties, lobby) => {
  const self = new Proxy(properties, {
    get: (obj, prop) => {
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;
      lobby.updateRoom(self, prop);
      //// self.updateRoom(self, prop);
      return true;
    }
  });

  return self;
};

const PersonalRoom = (lobby) => {
  const leaveRoom = () => {
    unload();
  };

  const listUser = ({ id, name }) => {
    els.userList.insertAdjacentHTML("beforeend",
        `<li data-id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const load = (base, data) => {
    properties.base = base;

    //// TODO: deal with other sync data
    // console.log(data.props);

    data.users.forEach((user) => {
      self.users.set(user.id, user.props);
    });
  };

  const unlistUser = (id) => {
    const li = els.userList.querySelector(`[data-id=${id}]`);
    li.remove();
  };

  const unload = () => {
    self.socket.emit("leaveRoom");
    self.users.clear();
    app.view = "lobby";
  };

  const updateUser = (user, prop) => {
    const shownInRoom = new Set(["name"]);

    if (shownInRoom.has(prop)) {
      const el = els.userList.querySelector(`[data-id="${user.id}"] .${prop}`);
      el.innerText = user[prop];
    }
  };


  const actions = {
    " ": ["dropBomb", false],
    "ArrowUp": ["moveUp", false],
    "ArrowRight": ["moveRight", false],
    "ArrowDown": ["moveDown", false],
    "ArrowLeft": ["moveLeft", false]
  };

  const endAction = (action) => {
    action[1] = false;

    switch (action[0]) {
      case "moveUp":
      case "moveRight":
      case "moveDown":
      case "moveLeft":
        self.socket.emit("halt");
        break;
    }
  };

  const startAction = (action) => {
    console.log("start:", action[0]);

    action[1] = true;

    switch (action[0]) {
      case "dropBomb":
        self.socket.emit("dropBomb");
        break;
      case "moveUp":
        self.socket.emit("move", 270);
        break;
      case "moveRight":
        self.socket.emit("move", 0);
        break;
    }
  };


  const els = {
    leaveRoom: document.getElementById("room-view-leave"),
    userList: document.getElementById("room-view-users")
  };

  const properties = {
    base: {},
    socket: lobby.socket,
    users: new Map(),

    get leaveRoom () { return leaveRoom; },
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
      obj[prop] = val;
      return true;
    }
  });

  self.users.set = (...args) => {
    listUser(args[1]);
    return Map.prototype.set.apply(self.users, args);
  };

  self.users.clear = (...args) => {
    while (els.userList.firstChild) {
      els.userList.removeChild(els.userList.firstChild);
    }
    return Map.prototype.clear.apply(self.users, args);
  };

  self.users.delete = (...args) => {
    unlistUser(args[0]);
    return Map.prototype.delete.apply(self.users, args);
  };


  self.socket.on("addLocalUser", (...users) => {
    users.forEach((data) => {
      const user = lobby.users.get(data.id);
      self.users.set(user.id, user);
    });

    return;
  });

  self.socket.on("deleteLocalUser", (...ids) => {
    ids.forEach((id)  => {
      self.users.delete(id);
    });
  });

  self.socket.on("updateLocalUser", (...users) => {
    // users.forEach((data) => {
    //   Object.assign(self.users.get(data.id), data);
    // });

    //// updateUser(self, prop);
  });


  document.addEventListener("keydown", (e) => {
    const action = actions[e.key];

    if (action && !action[1]) {
      startAction(action);
    }

    //// client.avatar.move(angle);
  });

  document.addEventListener("keyup", (e) => {
    const action = actions[e.key];

    if (action) {
      endAction(action);
    }
  });

  els.leaveRoom.addEventListener("click", (e) => {
    leaveRoom();
  });


  return self;
};
