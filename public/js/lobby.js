"use strict";


const LobbyRoom = (properties) => {
  const shared = new Set(["id", "name"]);

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;

      if (shared.has(prop)) {
        // lobbyIo.emit("updateUser", { id: p.id, prop, val });
      }

      return true;
    }
  });


  return p;
};

const LobbyUser = (props) => {
  const shared = new Set(["id", "name"]);

  const p = new Proxy(props, {
    get: function(obj, prop) {
      return obj[prop];
    },
    set: function(obj, prop, val) {
      obj[prop] = val;

      if (shared.has(prop)) {
        // lobbyIo.emit("updateUser", { id: p.id, prop, val });
      }

      return true;
    }
  });


  return p;
};





const Lobby = () => {
  const lobbyIo = io.connect(`${url}/lobby`);

  const fields = {
    createRoom: document.getElementById("create-room"),
    login: document.getElementById("login"),
    userList: document.getElementById("user-list"),
    userName: document.getElementById("user-name"),
    roomName: document.getElementById("room-name"),
    roomList: document.getElementById("room-list")
  };

  let room,
      user;

  const rooms = new Map(),
        users = new Map();


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

  const login = () => {
    const name = fields.userName.value;

    lobbyIo.emit("login", name);
  };


  const listRoom = ({ id, name }) => {
    fields.roomList.insertAdjacentHTML("beforeend",
        `<li id="r${id}">` +
        `<a href="#" data-id="${id}">${name}</a>` +
        `</li>`);
  };

  const relistRoom = ({ id, name }) => {
    const el = document.getElementById(`r${id}`);
    el.innerText = name;
  };

  const unlistRoom = (id) => {
    const li = document.getElementById(`r${id}`);
    li.remove();
  };


  const listUser = ({ id, name }) => {
    fields.userList.insertAdjacentHTML("beforeend",
        `<li id="u${id}">` +
        `${name}` +
        `</li>`);
  };

  const relistUser = ({ id, name }) => {
    const el = document.getElementById(`u${id}`);
    el.innerText = name;
  };

  const unlistUser = (id) => {
    const li = document.getElementById(`u${id}`);
    li.remove();
  };



  lobbyIo.on("connectionError", (err) => {
    console.warn(err);
  });

  lobbyIo.on("disconnect", (reason) => {
    //// TODO: use proxy instead?
    while (fields.roomList.firstChild) {
      fields.roomList.removeChild(fields.roomList.firstChild);
    }

    while (fields.userList.firstChild) {
      fields.userList.removeChild(fields.userList.firstChild);
    }

    console.log("Server connection lost!");
  });

  lobbyIo.on("ioError", (err) => {
    console.warn(err);
  });


  lobbyIo.on("addRoom", (props) => {
    const room = LobbyRoom(props);
    rooms.set(room.id, room);
    listRoom(room);
  });

  lobbyIo.on("deleteRoom", (id) => {
    rooms.delete(id);
    unlistRoom(id);
  });

  lobbyIo.on("joinRoom", (id) => {
    room = rooms.get(id);

    console.log("You have entered", room.name);
  });


  lobbyIo.on("addUser", (props) => {
    const user = LobbyUser(props);
    users.set(user.id, user);
    listUser(user);
  });

  lobbyIo.on("deleteUser", (id) => {
    users.delete(id);
    unlistUser(id);
  });

  lobbyIo.on("updateUser", ({ id, prop, val }) => {
    const user = users.get(id)
    user[prop] = val;
    relistUser(user);
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


  return {
    addRoom,
    joinRoom,
    leaveRoom
  };
};
