"use strict";


const Room = (properties, lobby) => {
  const self = new Proxy(properties, {
    set: (obj, prop, val) => {
      obj[prop] = val;
      lobby.updateRoom(self, prop);
      return true;
    }
  });

  return self;
};

const LocalRoom = (lobby) => {
  const addUser = (id, props) => {
    const local = LocalUser(lobby.users.get(id), lobby);
    self.users.set(local.id, local);
    Object.assign(local, props);
  };

  const leaveRoom = () => {
    unload();
  };

  const listen = () => {
    self.socket.on("addLocalUser", (...users) => {
      users.forEach((user) => {
        addUser(user.id, user.props);
      });
    });

    self.socket.on("deleteLocalUser", (...ids) => {
      ids.forEach((id)  => {
        self.users.delete(id);
      });
    });

    self.socket.on("loadLocalRoom", (data) => {
      load(lobby.rooms.get(data.id), data);
      app.view = "room";
    });

    self.socket.on("updateLocalRoom", (data) => {
      Object.assign(self, data.props);
    });

    self.socket.on("updateLocalUser", (...users) => {
      users.forEach((data) => {
        Object.assign(self.users.get(data.id), data.props);
      });
    });

    self.els.leaveRoom.addEventListener("click", (e) => {
      leaveRoom();
    });

    self.els.startGame.addEventListener("click", (e) => {
      startGame();
    });
  };

  const listUser = ({ id, name }) => {
    self.els.userList.insertAdjacentHTML("beforeend",
        `<li data-id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const load = (base, data) => {
    self.base = base;

    data.users.forEach((user) => {
      addUser(user.id, user.props);
    });

    Object.assign(self, data.props);

    const el = self.els.userList.querySelector(`[data-id="${lobby.personalUser.base.id}"]`);
    el.classList.add("personal");
  };

  const startGame = () => {
    self.socket.emit("startGame");
  };

  const unlistUser = (id) => {
    const li = self.els.userList.querySelector(`[data-id=${id}]`);
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
      const el = self.els.userList.querySelector(`[data-id="${user.id}"] .${prop}`);
      el.innerText = user[prop];
    }
  };


  const self = (() => {
    const properties = {
      base: {},
      els: {
        leaveRoom: document.getElementById("room-view-leave"),
        startGame: document.getElementById("room-view-start"),
        userList: document.getElementById("room-view-users")
      },
      socket: lobby.socket,
      users: new Map(),

      get leaveRoom () { return leaveRoom; },
      get updateUser () { return updateUser; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;

        if (prop === "ownerId") {
          const el = p.els.userList.querySelector(`[data-id="${val}"]`);
          el.classList.add("owner");

          if (val === lobby.personalUser.base.id) {
            p.els.startGame.classList.remove("hidden");
          }
          else {
            p.els.startGame.classList.add("hidden");
          }
        }

        return true;
      }
    });

    p.users.set = function (id, user) {
      listUser(user);
      return Map.prototype.set.apply(p.users, arguments);
    };

    p.users.clear = function () {
      while (p.els.userList.firstChild) {
        p.els.userList.removeChild(p.els.userList.firstChild);
      }
      return Map.prototype.clear.apply(p.users, arguments);
    };

    p.users.delete = function (id) {
      unlistUser(id);
      return Map.prototype.delete.apply(p.users, arguments);
    };

    return p;
  })();


  listen();





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


  return self;
};
