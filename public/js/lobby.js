"use strict";


const Lobby = () => {
  const addRoom = () => {
    const roomName = self.els.roomName.value;
    self.socket.emit("addRoom", roomName);
  };

  const joinRoom = (id) => {
    self.socket.emit("joinRoom", id);
  };

  const listen = () => {
    self.socket.on("addRoom", (...rooms) => {
      rooms.forEach((data)  => {
        const room = Room(data.props, self);
        self.rooms.set(room.id, room);
      });
    });

    self.socket.on("addUser", (...users) => {
      users.forEach((data) => {
        const user = User(data.props, self);
        self.users.set(user.id, user);
      });
    });

    self.socket.on("deleteRoom", (...ids) => {
      ids.forEach((id)  => {
        self.rooms.delete(id);
      });
    });

    self.socket.on("deleteUser", (...ids) => {
      ids.forEach((id)  => {
        self.users.delete(id);
      });
    });

    self.socket.on("disconnect", (reason) => {
      unload();
      console.log("Lobby connection lost!");
    });

    self.socket.on("ioError", (err) => {
      console.warn(err);
    });

    self.socket.on("loadPersonalUser", (id) => {
      const el = self.els.userList.querySelector(`[data-id="${id}"]`);
      el.classList.add("personal");
    });

    self.socket.on("updateLobbyRoom", (...rooms) => {
      rooms.forEach((data) => {
        Object.assign(self.rooms.get(data.id), data.props);
      });
    });

    self.socket.on("updateLobbyUser", (...users) => {
      users.forEach((data) => {
        Object.assign(self.users.get(data.id), data.props);
      });
    });

    self.els.createRoom.addEventListener("click", (e) => {
      addRoom();
    });

    self.els.login.addEventListener("click", (e) => {
      login();
    });

    self.els.roomList.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        joinRoom(e.target.dataset.id);
      }
    });
  };

  const listRoom = ({ id, name, numUsers, maxUsers }) => {
    self.els.roomList.insertAdjacentHTML("beforeend",
        `<tr data-id="${id}">` +
          `<td><a class="name" href="#" data-id="${id}">${name}</a></td>` +
          `<td>` +
            `<span class="numUsers">${numUsers}</span> / ` +
            `<span class="maxUsers">${maxUsers}</span>` +
          `</td>` +
        `</tr>`);
  };

  const listUser = ({ id, name }) => {
    self.els.userList.insertAdjacentHTML("beforeend",
        `<li data-id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const login = () => {
    self.personalUser.name = self.els.userName.value;
  };

  const unlistRoom = (id) => {
    const li = self.els.roomList.querySelector(`[data-id="${id}"]`);
    li.remove();
  };

  const unlistUser = (id) => {
    const li = self.els.userList.querySelector(`[data-id="${id}"]`);
    li.remove();
  };

  const unload = () => {
    self.rooms.clear();
    self.users.clear();
    self.personalUser.room.leaveRoom();
  };

  const updateRoom = (room, prop) => {
    const shownInLobby = new Set(["name", "maxUsers", "numUsers"]);

    if (shownInLobby.has(prop)) {
      const el = self.els.roomList.querySelector(`[data-id="${room.id}"] .${prop}`);
      el.innerText = room[prop];
    }
  };

  const updateUser = (user, prop) => {
    const shownInLobby = new Set(["name"]);

    if (shownInLobby.has(prop)) {
      const el = self.els.userList.querySelector(`[data-id="${user.id}"] .${prop}`);
      el.innerText = user[prop];
    }
  };

  const self = (() => {
    const properties = Object.seal({
      els: {
        createRoom: document.getElementById("create-room"),
        login: document.getElementById("login"),
        roomList: document.getElementById("lobby-view-rooms"),
        roomName: document.getElementById("room-name"),
        userList: document.getElementById("lobby-view-users"),
        userName: document.getElementById("user-name")
      },
      personalUser: {},
      socket: io.connect(app.url),
      rooms: new Map(),
      users: new Map(),

      get updateRoom () { return updateRoom; },
      get updateUser () { return updateUser; }
    });

    const p = properties;

    p.personalUser = PersonalUser(p);

    p.rooms.set = function (id, room) {
      listRoom(room);
      return Map.prototype.set.apply(this, arguments);
    };

    p.rooms.clear = function () {
      while (p.els.roomList.firstChild) {
        p.els.roomList.removeChild(p.els.roomList.firstChild);
      }
      return Map.prototype.clear.apply(this, arguments);
    };

    p.rooms.delete = function (id) {
      unlistRoom(id);
      return Map.prototype.delete.apply(this, arguments);
    };

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
      unlistUser(id);
      return Map.prototype.delete.apply(this, arguments);
    };

    return p;
  })();


  listen();


  return self;
};
