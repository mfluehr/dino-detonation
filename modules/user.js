"use strict";

const Avatar = require("./avatar"),
      Util = require("./util"),
      randomName = require("./random-name"),
      sanitizer = require("./sanitizer");


const User = (socket, lobby) => {
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
        p.socket.emit("ioError", err);
      }
    }
    else {
      p.socket.emit("ioError", "The specified room doesn't exist.");
    }
  };


  const lobbyData = new Set(["name"]),
        privateData = new Set(["email"]);

  const properties = {
    id: "u" + socket.conn.id,
    avatar: undefined,
    email: "noreply@example.com",
    lobby,
    socket,
    name: randomName(),
    room: undefined
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
          if (val) {
            p.socket.emit("loadRoom", p.room.roomData);
            p.socket.join(p.id);
          }
        }
        else if (privateData.has(prop)) {
          p.socket.emit("updateUser", data);
        }
        else if (lobbyData.has(prop)) {
          p.lobby.clients.emit("updateUser", data);
        }
      }

      return true;
    }
  });

  properties.avatar = Avatar(p.socket, p);

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





  p.socket.on("dropBomb", () => {
    dropBomb();
  });

  p.socket.on("halt", () => {
    halt();
  });



  p.socket.on("addRoom", (name) => {
    name = sanitizer.toString(name, 20);

    try {
      const room = p.lobby.addRoom(name, p);
      joinRoom(room.id);
    }
    catch (err) {
      console.warn(err);
      p.socket.emit("ioError", err);
    }
  });

  p.socket.on("disconnect", (reason) => {
    if (p.room) {
      p.room.deleteUser(p.id);
    }

    p.lobby.deleteUser(p.id);
  });

  p.socket.on("joinRoom", (id) => {
    id = sanitizer.toString(id);
    joinRoom(id);
  });

  p.socket.on("leaveRoom", () => {
    if (p.room) {
      p.room.deleteUser(p.id);
    }
    else {
      p.socket.emit("ioError", "The user isn't in a room.");
    }
  });

  p.socket.on("startGame", () => {
    if (p.room) {
      p.room.startGame();
    }
    else {
      p.socket.emit("ioError", "The user isn't in a room.");
    }
  });

  p.socket.on("updateUser", ({ prop, val }) => {
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
          p.socket.emit("ioError", err);
        }
      }
      else {
        p.socket.emit("ioError", `"${prop}" failed to validate.`);
      }
    }
  });


  return p;
};

module.exports = User;
