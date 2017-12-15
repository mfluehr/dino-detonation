"use strict";

const Avatar = require("./avatar"),
      Util = require("./util"),
      randomName = require("./random-name"),
      Sanitizer = require("./sanitizer");


const User = (lobbySocket, lobby) => {
  const properties = {
    id: "u" + lobbySocket.conn.id,
    avatar: undefined,
    email: "noreply@example.com",
    name: randomName(),
    room: undefined,

    get finishRoomConnection () { return finishRoomConnection; }
  };

  Object.seal(properties);
  Util.freezeProperties(properties, ["id"]);
  const secret = new Set(["email"]),
        shared = new Set(["id", "name"]);

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop == "secret") {
        return {
          id: p.id,
          email: p.email
        };
      }
      else if (prop === "shared") {
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

        const data = { id: p.id };
        data[prop] = val;

        if (prop === "room") {
          ////
        }
        else if (secret.has(prop)) {
          lobbySocket.emit("updateUser", data);
        }
        else if (shared.has(prop)) {
          lobby.clients.emit("updateUser", data);
        }
      }

      return true;
    }
  });

  p.avatar = Avatar(lobbySocket, p);

  const sanitizer = {
    name: (name) => {
      name = Sanitizer.toString(name);

      if (!name) {
        throw "The user must have a name.";
      }

      lobby.users.forEach((user, id) => {
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

  const finishRoomConnection = (roomSocket) => {
    roomSocket.on("dropBomb", () => {
      dropBomb();
    });

    roomSocket.on("halt", () => {
      halt();
    });

    roomSocket.on("disconnect", (reason) => {
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
    }
    else {
      lobbySocket.emit("ioError", "The specified room doesn't exist.");
    }
  };


  lobbySocket.on("addRoom", (newName) => {
    newName = sanitizer.name(newName);

    try {
      const newRoom = lobby.addRoom(newName, p);
      joinRoom(newRoom.id);
    }
    catch (err) {
      console.warn(err);
      lobbySocket.emit("ioError", err);
    }
  });

  lobbySocket.on("disconnect", (reason) => {
    if (p.room) {
      //// p.room.deleteUser(p.id);
    }

    lobby.deleteUser(p.id);
  });

  lobbySocket.on("joinRoom", (roomId) => {
    //// TODO: sanitize
    joinRoom(roomId);
  });

  lobbySocket.on("leaveRoom", () => {
    if (p.room) {
      p.room.deleteUser(id);
    }
    else {
      lobbySocket.emit("ioError", "The user isn't in a room.");
    }
  });

  lobbySocket.on("startGame", () => {
    if (p.room) {
      p.room.startGame();
    }
    else {
      lobbySocket.emit("ioError", "The user isn't in a room.");
    }
  });

  lobbySocket.on("updateUser", ({ prop, val }) => {
    prop = prop + "";

    if (shared.has(prop) &&
        Object.getOwnPropertyDescriptor(p, prop).writable) {
      const sanitize = sanitizer[prop];

      if (sanitize) {
        try {
          val = sanitize(val);
          p[prop] = val;
        }
        catch (err) {
          console.warn(err);
          lobbySocket.emit("ioError", err);
        }
      }
      else {
        lobbySocket.emit("ioError", `"${prop}" failed to validate.`);
      }
    }
  });


  return p;
};

module.exports = User;
