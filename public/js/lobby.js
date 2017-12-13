"use strict";


// const User = () => {
//   let userId,
//         avatar;
//
//   let name = "";
// };





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

  let userId,
      room,
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
    const info = {
      name: fields.userName.value
    };

    lobbyIo.emit("login", info);
  };


  const listRoom = ({ roomId, name }) => {
    fields.roomList.insertAdjacentHTML("beforeend",
        `<li id="r${roomId}">` +
        `<a href="#" data-id="${roomId}">${name}</a>` +
        `</li>`);
  };

  const listUser = ({ userId, name }) => {
    fields.userList.insertAdjacentHTML("beforeend",
        `<li id="u${userId}">` +
        `${name}` +
        `</li>`);
  };

  const relistRoom = ({ roomId, name }) => {
    const el = document.getElementById(`u${roomId}`);
    el.innerText = name;
  };

  const relistUser = ({ userId, name }) => {
    const el = document.getElementById(`u${userId}`);
    el.innerText = name;
  };

  const unlistRoom = ({ roomId }) => {
    ////
  };

  const unlistUser = ({ userId }) => {
    const li = document.getElementById(`u${userId}`);
    li.remove();
  };


  lobbyIo.on("addRoom", (data) => listRoom(data));
  lobbyIo.on("addUser", (data) => listUser(data));
  lobbyIo.on("deleteRoom", (data) => unlistRoom(data));
  lobbyIo.on("deleteUser", (data) => unlistUser(data));
  lobbyIo.on("editUser", (data) => relistUser(data));

  lobbyIo.on("connectionError", (err) => {
    console.warn(err);
  });

  lobbyIo.on("connectionMade", (newUserId) => {
    userId = newUserId;

    console.log("Connected to server.");
  });

  lobbyIo.on("disconnect", (reason) => {
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

  lobbyIo.on("joinRoom", ({ roomId }) => {
    room = Room(roomId);

    console.log("You have entered", roomId);
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
