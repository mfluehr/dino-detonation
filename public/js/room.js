"use strict";


const Room = (id) => {
  const roomIo = io.connect(`${url}/${id}`);

  const els = {
    leaveRoom: document.getElementById("leave-room")
  };

  const actions = {
    " ": ["dropBomb", false],
    "ArrowUp": ["moveUp", false],
    "ArrowRight": ["moveRight", false],
    "ArrowDown": ["moveDown", false],
    "ArrowLeft": ["moveLeft", false]
  };


  const endAction = (action) => {
    action[1] = false;

    switch (action[0]) {
      case "moveUp":
      case "moveRight":
      case "moveDown":
      case "moveLeft":
        roomIo.emit("halt");
        break;
    }
  };

  const startAction = (action) => {
    console.log("start:", action[0]);

    action[1] = true;

    switch (action[0]) {
      case "dropBomb":
        roomIo.emit("dropBomb");
        break;
      case "moveUp":
        roomIo.emit("move", 270);
        break;
      case "moveRight":
        roomIo.emit("move", 0);
        break;
    }
  };


  const leaveRoom = () => {
    //// roomIo.emit("leaveRoom", p.user.id);
  };


  roomIo.on("addUser", () => {
    ////
  });

  roomIo.on("deleteUser", (userId) => {
    ////
  });

  roomIo.on("ioError", (err) => {
    console.warn(err);
  });


  document.addEventListener("keydown", (e) => {
    const action = actions[e.key];

    if (action && !action[1]) {
      startAction(action);
    }

    ////client.avatar.move(angle);
  });

  document.addEventListener("keyup", (e) => {
    const action = actions[e.key];

    if (action) {
      endAction(action);
    }
  });


  els.leaveRoom.addEventListener("click", (e) => {
    leaveRoom();
  });
};
