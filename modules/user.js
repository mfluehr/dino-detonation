"use strict";

const Validator = require("validator");
const Avatar = require("./avatar");
const Util = require("./util");
const randomName = require("./random-name");


const User = (lobbySocket, lobby) => {
  const properties = {
    id: lobbySocket.conn.id,
    avatar: undefined,
    email: "noreply@example.com",
    name: randomName(),
    room: undefined,

    get finishRoomConnection () { return finishRoomConnection; }
  };

  const shared = new Set(["id", "name"]);

  const p = new Proxy(properties, {
    get: function(obj, prop) {
      return obj[prop];
    },
    set: function(obj, prop, val) {
      if (obj[prop] !== val) {
        obj[prop] = val;

        if (shared.has(prop)) {
          lobby.clients.emit("updateUser", { id: p.id, prop, val });
        }
        else {
          lobbySocket.emit("updateUser", { id: p.id, prop, val });
        }
      }

      return true;
    }
  });

  properties.avatar = Avatar(lobbySocket, p);

  Util.freezeProperties(properties, ["id", "avatar"]);


  const dropBomb = () => {
    //room.level.addBomb(id);
    console.log("Drop");
  };

  const halt = () => {
    // console.log("Halt!");
  };

  const finishRoomConnection = (roomSocket) => {
    roomSocket.on("dropBomb", function () {
      dropBomb();
    });

    roomSocket.on("halt", function () {
      halt();
    });

    roomSocket.on("disconnect", function (reason) {
      p.room.deleteUser(p.id);
    });
  };

  const joinRoom = (roomId) => {
    const newRoom = lobby.rooms.get(roomId);

    if (newRoom) {
      try {
        newRoom.addUser(p.id);
      }
      catch (err) {
        console.warn(err);
        lobbySocket.emit("ioError", err);
      }

      p.room = newRoom;
      //// lobbySocket.emit("joinRoom", p.room.id);
    }
    else {
      lobbySocket.emit("ioError", "The specified room doesn't exist.");
    }
  };

  const login = (name) => {
    if (!name) {
      throw "The user must have a name.";
    }

    lobby.users.forEach((user, id) => {
      if (p.name === name) {
        throw "A user with the specified name already exists.";
      }
    })

    p.name = name;
  };


  lobbySocket.on("addRoom", function (name) {
    try {
      const roomId = lobby.addRoom(name, p);
      joinRoom(roomId);
    }
    catch (err) {
      console.warn(err);
      lobbySocket.emit("ioError", err);
    }
  });

  lobbySocket.on("disconnect", function (reason) {
    if (p.room) {
      //// p.room.deleteUser(p.id);
    }

    lobby.deleteUser(p.id);
  });

  lobbySocket.on("joinRoom", function (roomId) {
    joinRoom(roomId);
  });

  lobbySocket.on("leaveRoom", function () {
    if (p.room) {
      p.room.deleteUser(id);
    }
    else {
      lobbySocket.emit("ioError", "The user isn't in a room.");
    }
  });

  lobbySocket.on("login", function (newName) {
    newName = newName + "";
    newName = Validator.whitelist(newName.substr(0, 20), /\w/)

    try {
      login(newName)
    }
    catch (err) {
      console.warn(err);
      lobbySocket.emit("ioError", err);
    }
  });

  lobbySocket.on("startGame", function () {
    if (p.room) {
      p.room.startGame();
    }
    else {
      lobbySocket.emit("ioError", "The user isn't in a room.");
    }
  });


  return p;
};

module.exports = User;
