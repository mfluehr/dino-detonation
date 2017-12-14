"use strict";

const Validator = require("validator"),
      Avatar = require("./avatar"),
      Util = require("./util"),
      randomName = require("./random-name");


const User = (lobbySocket, lobby) => {
  const properties = {
    id: lobbySocket.conn.id,
    email: "noreply@example.com",
    name: randomName(),

    get avatar () { return avatar; },
    get room () { return room; },

    get finishRoomConnection () { return finishRoomConnection; }
  };

  Object.seal(properties);
  Util.freezeProperties(properties, ["id"]);
  const secret = new Set(["email"]);

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "shared") {
        return {
          id: p.id,
          name: p.name
        };
      }

      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (obj[prop] !== val) {
        obj[prop] = val;

        if (secret.has(prop)) {
          lobbySocket.emit("updateUser", { id: p.id, prop, val });
        }
        else {
          lobby.clients.emit("updateUser", { id: p.id, prop, val });
        }
      }

      return true;
    }
  });

  const avatar = Avatar(lobbySocket, p);
  let room;


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
      room.deleteUser(p.id);
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

      room = newRoom;
      //// lobbySocket.emit("joinRoom", room.id);
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


  lobbySocket.on("addRoom", function (newName) {
    newName += "";
    newName = newName.substr(0, 20).trim().replace(/  +/g, " ");
    newName = Validator.whitelist(newName, /\w /);

    try {
      const newRoom = lobby.addRoom(newName, p);
      joinRoom(newRoom.id);
    }
    catch (err) {
      console.warn(err);
      lobbySocket.emit("ioError", err);
    }
  });

  lobbySocket.on("disconnect", function (reason) {
    if (room) {
      //// room.deleteUser(p.id);
    }

    lobby.deleteUser(p.id);
  });

  lobbySocket.on("joinRoom", function (roomId) {
    //// TODO: sanitize
    joinRoom(roomId);
  });

  lobbySocket.on("leaveRoom", function () {
    if (room) {
      room.deleteUser(id);
    }
    else {
      lobbySocket.emit("ioError", "The user isn't in a room.");
    }
  });

  lobbySocket.on("login", function (newName) {
    newName += "";
    newName = newName.substr(0, 20).trim().replace(/  +/g, " ");
    newName = Validator.whitelist(newName, /\w /);

    try {
      login(newName)
    }
    catch (err) {
      console.warn(err);
      lobbySocket.emit("ioError", err);
    }
  });

  lobbySocket.on("startGame", function () {
    if (room) {
      room.startGame();
    }
    else {
      lobbySocket.emit("ioError", "The user isn't in a room.");
    }
  });


  return p;
};

module.exports = User;
