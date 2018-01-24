"use strict";


const Room = (properties, lobby) => {
  const self = new Proxy(properties, {
    set: (obj, prop, val) => {
      obj[prop] = val;
      lobby.showRoomUpdate(self, prop);
      return true;
    }
  });

  return self;
};

const LocalRoom = (lobby, data) => {
  const addUser = (user) => {
    const localUser = LocalUser(lobby.users.get(user.id), self);
    self.users.set(localUser.id, localUser);
    Object.assign(localUser, user.props);
  };

  const deleteUser = (id) => {
    self.users.delete(id);
  };

  const listenToServer = () => {
    self.socket.on("addLocalUser", addUser);
    self.socket.on("deleteLocalUser", deleteUser);
    self.socket.on("loadLocalLevel", loadLocalLevel);
    self.socket.on("updateLocalRoom", updateRoom);
    self.socket.on("updateLocalUser", updateUser);
  };

  const listenToUser = () => {
    self.els.leaveRoom.addEventListener("click", unload);
    self.els.startGame.addEventListener("click", app.user.startGame);
  };

  const load = (data) => {
    data.users.forEach((user) => addUser(user));
    Object.assign(self, data.props);

    const el = self.els.userList.querySelector(`[data-id="${app.user.id}"]`);
    el.classList.add("personal");

    listenToServer();
    listenToUser();
    app.view = "room";
  };

  const loadLocalLevel = (data) => {
    self.level = LocalLevel(self, data);
  };

  const showUser = ({ id, name }) => {
    self.els.userList.insertAdjacentHTML("beforeend",
        `<li data-id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const showUserUpdate = (user, prop) => {
    const shownInRoom = new Set(["name"]);

    if (shownInRoom.has(prop)) {
      const el = self.els.userList.querySelector(`[data-id="${user.id}"] .${prop}`);
      el.innerText = user[prop];
    }
  };

  const unlistenToServer = () => {
    self.socket.off("addLocalUser", addUser);
    self.socket.off("deleteLocalUser", deleteUser);
    self.socket.off("loadLocalLevel", loadLocalLevel);
    self.socket.off("updateLocalRoom", updateRoom);
    self.socket.off("updateLocalUser", updateUser);
  };

  const unlistenToUser = () => {
    self.els.leaveRoom.removeEventListener("click", unload);
    self.els.startGame.removeEventListener("click", app.user.startGame);
  };

  const unshowUser = (id) => {
    const li = self.els.userList.querySelector(`[data-id=${id}]`);
    li.remove();
  };

  const unload = () => {
    self.socket.emit("leaveRoom");
    unlistenToServer();
    unlistenToUser();
    unloadLevel();
    unloadUsers();
    app.view = "lobby";
  };

  const unloadLevel = () => {
    if (self.level) {
      self.level.unload();
    }
  };

  const unloadUsers = () => {
    self.users.clear();
  };

  const updateRoom = (data) => {
    Object.assign(self, data.props);
  };

  const updateUser = (data) => {
    Object.assign(self.users.get(data.id), data.props);
  };


  const self = (() => {
    const properties = {
      els: {
        leaveRoom: document.getElementById("room-view-leave"),
        startGame: document.getElementById("room-view-start"),
        userList: document.getElementById("room-view-users")
      },
      socket: lobby.socket,
      users: new Map(),

      get showUserUpdate () { return showUserUpdate; },
      get unload () { return unload; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;

        if (prop === "ownerId") {
          const el = p.els.userList.querySelector(`[data-id="${val}"]`);
          el.classList.add("owner");

          if (val === app.user.id) {
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
      showUser(user);
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


  load(data);


  return self;
};
