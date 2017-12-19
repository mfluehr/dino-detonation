"use strict";


const Lobby = () => {
  const addRoom = () => {
    const roomName = els.roomName.value;
    p.lobbyIo.emit("addRoom", roomName);
  };

  const joinRoom = (id) => {
    p.lobbyIo.emit("joinRoom", id);
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
    p.user.name = els.userName.value;
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

  const p = {
    lobbyIo: io.connect(`${app.url}/lobby`),
    room: undefined,
    rooms: new Map(),
    user: undefined,
    users: new Map(),

    get addRoom () { return addRoom; },
    get joinRoom () { return joinRoom; },
    get leaveRoom () { return leaveRoom; }
  };

  p.rooms.set = (...args) => {
    listRoom(args[1]);
    return Map.prototype.set.apply(p.rooms, args);
  };

  p.rooms.clear = (...args) => {
    while (els.roomList.firstChild) {
      els.roomList.removeChild(els.roomList.firstChild);
    }
    return Map.prototype.clear.apply(p.rooms, args);
  };

  p.rooms.delete = (...args) => {
    unlistRoom(args[0]);
    return Map.prototype.delete.apply(p.rooms, args);
  };

  p.users.set = (...args) => {
    listUser(args[1]);
    return Map.prototype.set.apply(p.users, args);
  };

  p.users.clear = (...args) => {
    while (els.userList.firstChild) {
      els.userList.removeChild(els.userList.firstChild);
    }
    return Map.prototype.clear.apply(p.users, args);
  };

  p.users.delete = (...args) => {
    unlistUser(args[0]);
    return Map.prototype.delete.apply(p.users, args);
  };


  p.lobbyIo.on("addRoom", (...rooms) => {
    rooms.forEach((data)  => {
      const room = Room(data, p.lobbyIo);
      p.rooms.set(room.id, room);
    });
  });

  p.lobbyIo.on("addUser", (...users) => {
    users.forEach((data) => {
      const user = User(data, p.lobbyIo);
      p.users.set(user.id, user);
    });
  });

  p.lobbyIo.on("deleteRoom", (...ids) => {
    ids.forEach((id)  => {
      p.rooms.delete(id);
    });
  });

  p.lobbyIo.on("deleteUser", (...ids) => {
    ids.forEach((id)  => {
      p.users.delete(id);
    });
  });

  p.lobbyIo.on("disconnect", (reason) => {
    p.rooms.clear();
    p.users.clear();
    console.log("Lobby connection lost!");
  });

  p.lobbyIo.on("ioError", (err) => {
    console.warn(err);
  });

  p.lobbyIo.on("loadRoom", (syncData) => {
    p.room = LocalRoom(p.rooms.get(syncData.id).base, syncData);
    app.view = "room";
  });

  p.lobbyIo.on("loadUser", (id) => {
    p.user = LocalUser(p.users.get(id).base);
    app.view = "lobby";
  });

  p.lobbyIo.on("updateRoom", (...rooms) => {
    rooms.forEach((data) => {
      Object.assign(p.rooms.get(data.id), data);
    });
  });

  p.lobbyIo.on("updateUser", (...users) => {
    users.forEach((data) => {
      Object.assign(p.users.get(data.id), data);
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


  return p;
};
