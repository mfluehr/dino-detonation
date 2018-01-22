"use strict";


const Room = (properties, lobby) => {
  const self = new Proxy(properties, {
    set: (obj, prop, val) => {
      obj[prop] = val;
      lobby.showRoom(self, prop);
      return true;
    }
  });

  return self;
};

const LocalRoom = (lobby) => {
  const addUsers = (users) => {
    users.forEach((user) => {
      const localUser = LocalUser(lobby.users.get(user.id), lobby);
      self.users.set(localUser.id, localUser);
      Object.assign(localUser, user.props);
    });
  };

  const listen = () => {
    self.socket.on("addLocalUser", (...data) => addUsers(data));
    self.socket.on("deleteLocalUser", (id) => self.users.delete(id));

    self.socket.on("loadLocalLevel", (data) => {
      console.log(data);
      app.view = "game";
    });

    self.socket.on("loadLocalRoom", (data) => load(data));
    self.socket.on("updateLocalRoom", (data) => updateRoom(data));
    self.socket.on("updateLocalUser", (data) => updateUser(data));

    self.els.leaveRoom.addEventListener("click", (e) => unload());
    self.els.startGame.addEventListener("click", (e) => startGame());
  };

  const listUser = ({ id, name }) => {
    self.els.userList.insertAdjacentHTML("beforeend",
        `<li data-id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const load = (data) => {
    self.base = lobby.rooms.get(data.id);
    addUsers(data.users);
    Object.assign(self, data.props);

    const el = self.els.userList.querySelector(`[data-id="${lobby.personalUser.base.id}"]`);
    el.classList.add("personal");
    app.view = "room";
  };

  const showUser = (user, prop) => {
    const shownInRoom = new Set(["name"]);

    if (shownInRoom.has(prop)) {
      const el = self.els.userList.querySelector(`[data-id="${user.id}"] .${prop}`);
      el.innerText = user[prop];
    }
  };

  const startGame = () => {
    self.socket.emit("startGame");
  };

  const unshowUser = (id) => {
    const li = self.els.userList.querySelector(`[data-id=${id}]`);
    li.remove();
  };

  const unload = () => {
    self.socket.emit("leaveRoom");
    self.users.clear();
    app.view = "lobby";
  };

  const updateRoom = (data) => {
    Object.assign(self, data.props);
  };

  const updateUser = (data) => {
    Object.assign(self.users.get(data.id), data.props);
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

      get showUser () { return showUser; },
      get unload () { return unload; }
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
      return Map.prototype.set.apply(this, arguments);
    };

    p.users.clear = function () {
      while (p.els.userList.firstChild) {
        p.els.userList.removeChild(p.els.userList.firstChild);
      }
      return Map.prototype.clear.apply(this, arguments);
    };

    p.users.delete = function (id) {
      unshowUser(id);
      return Map.prototype.delete.apply(this, arguments);
    };

    return p;
  })();


  listen();


  return self;
};
