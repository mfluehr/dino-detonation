"use strict";


const LobbyRoom = (properties, lobbyIo) => {
  const editable = new Set(["name"]);

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (editable.has(prop)) {
        obj[prop] = val;
        lobbyIo.emit("updateRoom", { prop, val });

        return true;
      }

      return false;
    }
  });

  return p;
};

const LobbyUser = (properties, lobbyIo) => {
  const editable = new Set(["email", "name"]);
  const displayed = new Set(["name"]);

  properties.receive = (data) => {
    properties.receiving = true;
    Object.assign(p, data);
    properties.receiving = false;
  };

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "el") {
        return document.getElementById(`${p.id}`);
      }

      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (p.receiving) {
        obj[prop] = val;

        if (displayed.has(prop)) {
          p.el.querySelector(`.${prop}`).innerText = val;
        }

        return true;
      }
      else if (editable.has(prop)) {
        lobbyIo.emit("updateUser", { prop, val });
        return true;
      }

      return false;
    }
  });

  return p;
};





const Lobby = () => {
  const lobbyIo = io.connect(`${url}/lobby`);

  const p = {
    rooms: new Map(),
    users: new Map(),
    user: undefined,

    get addRoom () { return addRoom; },
    get joinRoom () { return joinRoom; },
    get leaveRoom () { return leaveRoom; }
  };

  const fields = {
    createRoom: document.getElementById("create-room"),
    login: document.getElementById("login"),
    userList: document.getElementById("user-list"),
    userName: document.getElementById("user-name"),
    roomName: document.getElementById("room-name"),
    roomList: document.getElementById("room-list")
  };


  const addRoom = () => {
    const name = fields.roomName.value;
    lobbyIo.emit("addRoom", name);
  };

  const joinRoom = (roomId) => {
    lobbyIo.emit("joinRoom", roomId);
  };

  const leaveRoom = () => {
    lobbyIo.emit("leaveRoom");
  };

  const listRoom = ({ id, name, numUsers, maxUsers }) => {
    fields.roomList.insertAdjacentHTML("beforeend",
        `<tr id="${id}">` +
          `<td><a class="name" href="#" data-id="${id}">${name}</a></td>` +
          `<td>` +
            `<span class="numUsers">${numUsers}</span> / ` +
            `<span class="maxUsers">${maxUsers}</span>` +
          `</td>` +
        `</tr>`);
  };

  const listUser = ({ id, name }) => {
    fields.userList.insertAdjacentHTML("beforeend",
        `<li id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const login = () => {
    p.user.name = fields.userName.value;
  };

  const unlistRoom = (id) => {
    const li = document.getElementById(`${id}`);
    li.remove();
  };

  const unlistUser = (id) => {
    const li = document.getElementById(`${id}`);
    li.remove();
  };


  lobbyIo.on("connectionSuccess", (id) => {
    p.user = p.users.get(id);
  });

  lobbyIo.on("disconnect", (reason) => {
    lobbyIo.off();

    //// TODO: use proxy instead?
    while (fields.roomList.firstChild) {
      fields.roomList.removeChild(fields.roomList.firstChild);
    }

    while (fields.userList.firstChild) {
      fields.userList.removeChild(fields.userList.firstChild);
    }

    p.rooms.clear();
    p.users.clear();

    console.log("Server connection lost!");
  });

  lobbyIo.on("ioError", (err) => {
    console.warn(err);
  });


  lobbyIo.on("addRoom", (...rooms) => {
    rooms.forEach((data)  => {
      const room = LobbyRoom(data, lobbyIo);
      p.rooms.set(room.id, room);
      listRoom(room);
    });
  });

  lobbyIo.on("deleteRoom", (...ids) => {
    ids.forEach((id)  => {
      p.rooms.delete(id);
      unlistRoom(id);
    });
  });


  lobbyIo.on("addUser", (...users) => {
    users.forEach((data) => {
      const user = LobbyUser(data, lobbyIo);
      p.users.set(user.id, user);
      listUser(user);
    });
  });

  lobbyIo.on("deleteUser", (...ids) => {
    ids.forEach((id)  => {
      p.users.delete(id);
      unlistUser(id);
    });
  });

  lobbyIo.on("updateUser", (...users) => {
    users.forEach((data) => {
      p.users.get(data.id).receive(data);
    });
  });










  fields.createRoom.addEventListener("click", (e) => {
    addRoom();
  });

  fields.login.addEventListener("click", (e) => {
    login();
  });

  fields.roomList.addEventListener("click", (e) => {
    if (e.target.tagName == "A") {
      joinRoom(e.target.dataset.id);
    }
  });


  return p;
};
