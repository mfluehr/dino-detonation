"use strict";


const Lobby = () => {
  const addRoom = () => {
    const roomName = els.roomName.value;
    self.socket.emit("addRoom", roomName);
  };

  const joinRoom = (id) => {
    self.socket.emit("joinRoom", id);
  };

  const listRoom = ({ id, name, numUsers, maxUsers }) => {
    els.roomList.insertAdjacentHTML("beforeend",
        `<tr data-id="${id}">` +
          `<td><a class="name" href="#" data-id="${id}">${name}</a></td>` +
          `<td>` +
            `<span class="numUsers">${numUsers}</span> / ` +
            `<span class="maxUsers">${maxUsers}</span>` +
          `</td>` +
        `</tr>`);
  };

  const listUser = ({ id, name }) => {
    els.userList.insertAdjacentHTML("beforeend",
        `<li data-id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const login = () => {
    self.user.name = els.userName.value;
  };

  const unlistRoom = (id) => {
    const li = els.roomList.querySelector(`[data-id="${id}"]`);
    li.remove();
  };

  const unlistUser = (id) => {
    const li = els.userList.querySelector(`[data-id="${id}"]`);
    li.remove();
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
    room: undefined,
    rooms: new Map(),
    user: undefined,
    users: new Map(),

    get addRoom () { return addRoom; },
    get joinRoom () { return joinRoom; },
    get leaveRoom () { return leaveRoom; }
  };

  self.rooms.set = (...args) => {
    listRoom(args[1]);
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


  self.socket.on("addRoom", (...rooms) => {
    rooms.forEach((data)  => {
      const room = Room(data, self.socket);
      self.rooms.set(room.id, room);
    });
  });

  self.socket.on("addUser", (...users) => {
    users.forEach((data) => {
      const user = User(data, self.socket);
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
    self.rooms.clear();
    self.users.clear();
    delete self.user;
    console.log("Lobby connection lost!");
  });

  self.socket.on("ioError", (err) => {
    console.warn(err);
  });

  self.socket.on("loadRoom", (syncData) => {
    self.room = LocalRoom(self.rooms.get(syncData.id), syncData);
    self.user.room = self.room;
    app.view = "room";
  });

  self.socket.on("loadUser", (id) => {
    const el = els.userList.querySelector(`[data-id="${id}"]`);
    el.classList.add("local");
    self.user = LocalUser(self.users.get(id));
    app.view = "lobby";
  });

  self.socket.on("updateRoom", (...rooms) => {
    rooms.forEach((data) => {
      Object.assign(self.rooms.get(data.id), data);
    });
  });

  self.socket.on("updateUser", (...users) => {
    users.forEach((data) => {
      Object.assign(self.users.get(data.id), data);
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
