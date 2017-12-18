"use strict";

const Avatar = require("./avatar"),
      Util = require("./util"),
      randomName = require("./random-name"),
      sanitizer = require("./sanitizer");


const User = (lobbySocket, lobby) => {
  const lobbyData = new Set(["name"]),
        privateData = new Set(["email"]);

  const properties = {
    id: "u" + lobbySocket.conn.id,
    avatar: undefined,
    email: "noreply@example.com",
    lobby,
    lobbySocket,
    name: randomName(),
    room: undefined,

    get joinRoomComplete () { return joinRoomComplete; }
  };

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "lobbyData") {
        return {
          id: p.id,
          name: p.name
        };
      }
      else if (prop === "roomData") {
        return {
          id: p.id,
          name: p.name
        };
      }
      else if (prop === "privateData") {
        return {
          id: p.id,
          email: p.email
        };
      }

      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (obj[prop] !== val) {
        obj[prop] = val;

        const data = { id: p.id };
        data[prop] = val;

        if (prop === "room") {
          p.lobbySocket.emit("loadRoom", p.room.roomData);
        }
        else if (privateData.has(prop)) {
          p.lobbySocket.emit("updateUser", data);
        }
        else if (lobbyData.has(prop)) {
          p.lobby.clients.emit("updateUser", data);
        }
      }

      return true;
    }
  });

  properties.avatar = Avatar(p.lobbySocket, p);

  Object.seal(properties);
  Util.freezeProperties(properties, ["id"]);

  const userSanitizer = {
    name: (name) => {
      name = sanitizer.toString(name);

      if (!name) {
        throw "The user must have a name.";
      }

      p.lobby.users.forEach((user, id) => {
        if (p.name === name) {
          throw "A user with the specified name already exists.";
        }
      })

      return name;
    }
  };


  const dropBomb = () => {
    //p.room.level.addBomb(id);
    console.log("Drop");
  };

  const halt = () => {
    // console.log("Halt!");
  };

  const joinRoom = (id) => {
    const room = p.lobby.rooms.get(id);

    if (room) {
      try {
        room.addUser(p.id);
      }
      catch (err) {
        console.warn(err);
        p.lobbySocket.emit("ioError", err);
      }

      p.room = room;
    }
    else {
      p.lobbySocket.emit("ioError", "The specified room doesn't exist.");
    }
  };

  const joinRoomComplete = (roomSocket) => {
    roomSocket.on("disconnect", (reason) => {
      p.room.deleteUser(p.id);
    });

    roomSocket.on("dropBomb", () => {
      dropBomb();
    });

    roomSocket.on("halt", () => {
      halt();
    });

    roomSocket.on("leaveRoom", () => {
      if (p.room) {
        p.room.deleteUser(p.id);
      }
      else {
        p.lobbySocket.emit("ioError", "The user isn't in a room.");
      }
    });
  };


  p.lobbySocket.on("addRoom", (name) => {
    name = sanitizer.toString(name, 20);

    try {
      const room = p.lobby.addRoom(name, p);
      joinRoom(room.id);
    }
    catch (err) {
      console.warn(err);
      p.lobbySocket.emit("ioError", err);
    }
  });

  p.lobbySocket.on("disconnect", (reason) => {
    if (p.room) {
      p.room.deleteUser(p.id);
    }

    p.lobby.deleteUser(p.id);
  });

  p.lobbySocket.on("joinRoom", (id) => {
    id = sanitizer.toString(id);
    joinRoom(id);
  });

  p.lobbySocket.on("startGame", () => {
    if (p.room) {
      p.room.startGame();
    }
    else {
      p.lobbySocket.emit("ioError", "The user isn't in a room.");
    }
  });

  p.lobbySocket.on("updateUser", ({ prop, val }) => {
    prop = sanitizer.toString(prop);

    if (lobbyData.has(prop) &&
        Object.getOwnPropertyDescriptor(p, prop).writable) {
      const san = userSanitizer[prop];

      if (san) {
        try {
          val = san(val, 20);
          p[prop] = val;
        }
        catch (err) {
          console.warn(err);
          p.lobbySocket.emit("ioError", err);
        }
      }
      else {
        p.lobbySocket.emit("ioError", `"${prop}" failed to validate.`);
      }
    }
  });


  return p;
};

module.exports = User;
