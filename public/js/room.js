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
  const addUsers = (users) => {
    users.forEach((user) => {
      const localUser = LocalUser(lobby.users.get(user.id));
      self.users.set(localUser.id, localUser);
      Object.assign(localUser, user.props);
    });
  };

  const listenToServer = () => {
    self.socket.on("addLocalUser", (...data) => addUsers(data));
    self.socket.on("deleteLocalUser", (id) => self.users.delete(id));
    self.socket.on("updateLocalRoom", (data) => updateRoom(data));
    self.socket.on("updateLocalUser", (data) => updateUser(data));
  };

  const listenToUser = () => {
    self.els.leaveRoom.addEventListener("click", (e) => unload());
    self.els.startGame.addEventListener("click", (e) => app.user.startGame());
  };

  const load = (data) => {
    self.base = lobby.rooms.get(data.id);
    addUsers(data.users);
    Object.assign(self, data.props);
    listenToServer();
    listenToUser();
    app.view = "room";

    const el = self.els.userList.querySelector(`[data-id="${app.user.id}"]`);
    el.classList.add("personal");
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

  const unshowUserUpdate = (id) => {
    const li = self.els.userList.querySelector(`[data-id=${id}]`);
    li.remove();
  };

  const unload = () => {
    //// unlisten to user

    self.socket.emit("leaveRoom");
    self.localLevel.unload();
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
      unshowUserUpdate(id);
      return Map.prototype.delete.apply(this, arguments);
    };

    p.localLevel = LocalLevel(p);

    return p;
  })();


  load(data);


  return self;
};
