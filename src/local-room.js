"use strict";

const LocalLevel = require("./local-level"),
      LocalUser = require("./local-user");


const LocalRoom = (app, lobby, data) => {
  const listenToServer = () => {
    app.socket.on("loadLocalLevel", loadLocalLevel);
    app.socket.on("loadLocalUser", loadUser);
    app.socket.on("syncAvatar", syncAvatar);
    app.socket.on("syncLocalRoom", syncRoom);
    app.socket.on("syncLocalUser", syncUser);
    app.socket.on("unloadLocalUser", unloadUser);
  };

  const listenToUser = () => {
    self.els.leaveRoom.addEventListener("click", unload);
    self.els.startGame.addEventListener("click", app.user.startGame);
  };

  const load = (data) => {
    self.els = {
      leaveRoom: document.getElementById("room-view-leave"),
      startGame: document.getElementById("room-view-start"),
      userList: document.getElementById("room-view-users")
    };

    app.user.room = self;
    data.users.forEach((user) => loadUser(user));
    Object.assign(self, data.props);

    const el = self.els.userList.querySelector(`[data-id="${app.user.id}"]`);
    el.classList.add("personal");

    listenToServer();
    listenToUser();
    app.view = "room";
  };

  const loadLocalLevel = (data) => {
    self.level = LocalLevel(app, self, data);
  };

  const loadUser = (data) => {
    const localUser = LocalUser(app, lobby.users.get(data.id), self);
    self.users.set(localUser.id, localUser);
    Object.assign(localUser, data.props);
    Object.assign(localUser.avatar, data.avatar.props);
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

  const syncAvatar = (data) => {
    self.users.get(data.id).avatar.sync(data);
  };

  const syncRoom = (data) => {
    Object.assign(self, data.props);
  };

  const syncUser = (data) => {
    Object.assign(self.users.get(data.id), data.props);
  };

  const unlistenToServer = () => {
    app.socket.off("loadLocalLevel", loadLocalLevel);
    app.socket.off("loadLocalUser", loadUser);
    app.socket.off("syncAvatar", syncAvatar);
    app.socket.off("syncLocalRoom", syncRoom);
    app.socket.off("syncLocalUser", syncUser);
    app.socket.off("unloadLocalUser", unloadUser);
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
    app.socket.emit("leaveRoom");
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

  const unloadUser = (id) => {
    self.users.delete(id);
  };

  const unloadUsers = () => {
    self.users.clear();
  };


  const self = (() => {
    const properties = {
      els: undefined,
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


module.exports = LocalRoom;
