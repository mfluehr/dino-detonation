"use strict";

const url = "http://dino.markfluehr.com:4000";
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


lobbyIo.on("addRoom", ({name, roomId}) => {
  roomList.insertAdjacentHTML("beforeend",
      `<tr id="${roomId}"><td>` +
      `<button onclick="joinRoom(${roomId})">${name}</button>` +
      `</td></tr>`);
});

lobbyIo.on("connectionError", (err) => {
  console.warn(err);
});

lobbyIo.on("joinRoom", () => {
  ////window.location.replace("/room");
  //url.post("/room");

  // var request = new XMLHttpRequest();
  // request.open('GET', '/room', true);
  //
  // request.onload = function () {
  //   if (this.status >= 200 && this.status < 400) {
  //     console.log("Success!!");
  //     console.log(this.response);
  //   }
  //   else {
  //     console.log("Error returned:", this.status);
  //   }
  // };
  //
  // request.onerror = function () {
  //   console.log("Connection error");
  // };
  //
  // request.send();




});





window.onload = () => {
  const info = {
    name: "Mark" + Math.floor(Math.random() * 900)
  };

  lobbyIo.emit("login", info);
};
