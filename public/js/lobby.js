"use strict";


const Lobby = () => {
  const lobbyIo = io.connect(`${url}/lobby`);

  let roomList = document.getElementById("roomList");


  const addRoom = function () {
    const name = document.getElementById("roomName").value;

    lobbyIo.emit("addRoom", name, (err) => {
      console.warn(err);
    });
  };

  const joinRoom = (roomId) => {
    lobbyIo.emit("joinRoom", roomId, (err) => {
      console.warn(err);
    });
  };

  const leaveRoom = () => {
    lobbyIo.emit("leaveRoom", (err) => {
      console.warn(err);
    });
  };




  const listUser = ({ name, roomId }) => {
    roomList.insertAdjacentHTML("beforeend",
        `<tr data-id="${roomId}"><td>` +
        `<button data-id="${roomId}">${name}</button>` +
        `</td></tr>`);
  };

  const unlistUser = ({name}) => {
  };

  roomList.addEventListener("click", function (e) {
    if (e.target.tagName == "BUTTON") {
      joinRoom(e.target.dataset.id);
    }
  });




  lobbyIo.on("addRoom", ({ name, roomId }) => {
    listUser({name, roomId});
  });

  lobbyIo.on("connectionError", (err) => {
    console.warn(err);
  });

  lobbyIo.on("joinRoom", ({ roomId }) => {
    console.log("You have entered", roomId);

    room = Room(roomId);
  });






  window.onload = () => {
    const info = {
      name: "User" + Math.floor(Math.random() * 900)
    };

    lobbyIo.emit("login", info);
  };



  return {
    addRoom,
    joinRoom,
    leaveRoom
  };
};
