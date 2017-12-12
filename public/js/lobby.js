"use strict";


const Lobby = () => {
  const lobbyIo = io.connect(`${url}/lobby`);

  let userName = document.getElementById("user-name"),
      roomName = document.getElementById("room-name"),
      roomList = document.getElementById("room-list"),
      userList = document.getElementById("user-list");

  let room;


  const addRoom = function () {
    const name = roomName.value;

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
      name: userName.value
    };

    lobbyIo.emit("login", info);
  };


  const listRoom = ({ roomId, name }) => {
    roomList.insertAdjacentHTML("beforeend",
        `<li id="r${roomId}">` +
        `<a href="#" data-id="${roomId}">${name}</a>` +
        `</li>`);
  };

  const listUser = ({ userId, name }) => {
    userList.insertAdjacentHTML("beforeend",
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

  lobbyIo.on("connectionMade", () => {
    login();

    console.log("Connected to server.");
  });

  lobbyIo.on("disconnect", (reason) => {
    while (roomList.firstChild) {
      roomList.removeChild(roomList.firstChild);
    }

    while (userList.firstChild) {
      userList.removeChild(userList.firstChild);
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


  roomList.addEventListener("click", function (e) {
    if (e.target.tagName == "A") {
      joinRoom(e.target.dataset.id);
    }
  });


  return {
    addRoom,
    joinRoom,
    leaveRoom,
    login
  };
};
