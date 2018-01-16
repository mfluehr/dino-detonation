"use strict";


const Lobby = () => {
  const addRoom = () => {
    const roomName = els.roomName.value;
    self.socket.emit("addRoom", roomName);
  };

  const joinRoom = (id) => {
    self.socket.emit("joinRoom", id);
  };

  const listRoom = (id, { name, numUsers, maxUsers }) => {
    els.roomList.insertAdjacentHTML("beforeend",
        `<tr data-id="${id}">` +
          `<td><a class="name" href="#" data-id="${id}">${name}</a></td>` +
          `<td>` +
            `<span class="numUsers">${numUsers}</span> / ` +
            `<span class="maxUsers">${maxUsers}</span>` +
          `</td>` +
        `</tr>`);
  };

  const listUser = (id, { name }) => {
    els.userList.insertAdjacentHTML("beforeend",
        `<li data-id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const login = () => {
    self.personalUser.name = els.userName.value;
  };

  const unlistRoom = (id) => {
    const li = els.roomList.querySelector(`[data-id="${id}"]`);
    li.remove();
  };

  const unlistUser = (id) => {
    const li = els.userList.querySelector(`[data-id="${id}"]`);
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
      const el = els.roomList.querySelector(`[data-id="${room.id}"] .${prop}`);
      el.innerText = room[prop];
    }
  };

  const updateUser = (user, prop) => {
    const shownInLobby = new Set(["name"]);

    if (shownInLobby.has(prop)) {
      const el = els.userList.querySelector(`[data-id="${user.id}"] .${prop}`);
      el.innerText = user[prop];
    }
  };


  const els = {
    createRoom: document.getElementById("create-room"),
    login: document.getElementById("login"),
    roomList: document.getElementById("lobby-view-rooms"),
    roomName: document.getElementById("room-name"),
    userList: document.getElementById("lobby-view-users"),
    userName: document.getElementById("user-name")
  };

  const self = {
    socket: io.connect(app.url),
    rooms: new Map(),
    users: new Map(),

    get updateRoom () { return updateRoom; },
    get updateUser () { return updateUser; }
  };

  self.personalUser = PersonalUser(self);

  self.rooms.set = (...args) => {
    listRoom(args[0], args[1]);
    return Map.prototype.set.apply(self.rooms, args);
  };

  self.rooms.clear = (...args) => {
    while (els.roomList.firstChild) {
      els.roomList.removeChild(els.roomList.firstChild);
    }
    return Map.prototype.clear.apply(self.rooms, args);
  };

  self.rooms.delete = (...args) => {
    unlistRoom(args[0]);
    return Map.prototype.delete.apply(self.rooms, args);
  };

  self.users.set = (...args) => {
    listUser(args[0], args[1]);
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


  els.createRoom.addEventListener("click", (e) => {
    addRoom();
  });

  els.login.addEventListener("click", (e) => {
    login();
  });

  els.roomList.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      joinRoom(e.target.dataset.id);
    }
  });


  return self;
};
