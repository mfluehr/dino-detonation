"use strict";

const Avatar = require("./avatar"),
      Util = require("./util"),
      randomName = require("./random-name"),
      sanitizer = require("./sanitizer");


const User = (socket, lobby) => {
  const dropBomb = () => {
    //self.room.level.addBomb(id);
    console.log("Drop");
  };

  const halt = () => {
    // console.log("Halt!");
  };

  const joinRoom = (id) => {
    const room = self.lobby.rooms.get(id);

    if (room) {
      try {
        room.addUser(self.id);
      }
      catch (err) {
        console.warn(err);
        self.socket.emit("ioError", err);
      }
    }
    else {
      self.socket.emit("ioError", "The specified room doesn't exist.");
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

  const self = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "lobbyData") {
        return {
          id: self.id,
          name: self.name
        };
      }
      else if (prop === "roomData") {
        return {
          id: self.id,
          name: self.name
        };
      }
      else if (prop === "privateData") {
        return {
          id: self.id,
          email: self.email
        };
      }

      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (obj[prop] !== val) {
        obj[prop] = val;

        const data = { id: self.id };
        data[prop] = val;

        if (prop === "room") {
          if (val) {
            self.socket.emit("loadRoom", self.room.roomData);
            self.socket.join(self.room.id);
          }
        }
        else if (privateData.has(prop)) {
          self.socket.emit("updateUser", data);
        }
        else if (lobbyData.has(prop)) {
          self.lobby.clients.emit("updateUser", data);
        }
      }

      return true;
    }
  });

  properties.avatar = Avatar(self.socket, self);

  Object.seal(properties);
  Util.freezeProperties(properties, ["id"]);

  const userSanitizer = {
    name: (name) => {
      name = sanitizer.toString(name);

      if (!name) {
        throw "The user must have a name.";
      }

      self.lobby.users.forEach((user, id) => {
        if (self.name === name) {
          throw "A user with the specified name already exists.";
        }
      })

      return name;
    }
  };





  self.socket.on("dropBomb", () => {
    dropBomb();
  });

  self.socket.on("halt", () => {
    halt();
  });



  self.socket.on("addRoom", (name) => {
    name = sanitizer.toString(name, 20);

    try {
      const room = self.lobby.addRoom(name, self);
      joinRoom(room.id);
    }
    catch (err) {
      console.warn(err);
      self.socket.emit("ioError", err);
    }
  });

  self.socket.on("disconnect", (reason) => {
    if (self.room) {
      self.room.deleteUser(self.id);
    }

    self.lobby.deleteUser(self.id);
  });

  self.socket.on("joinRoom", (id) => {
    id = sanitizer.toString(id);
    joinRoom(id);
  });

  self.socket.on("leaveRoom", () => {
    if (self.room) {
      self.room.deleteUser(self.id);
    }
    else {
      self.socket.emit("ioError", "The user isn't in a room.");
    }
  });

  self.socket.on("startGame", () => {
    if (self.room) {
      self.room.startGame();
    }
    else {
      self.socket.emit("ioError", "The user isn't in a room.");
    }
  });

  self.socket.on("updateUser", ({ prop, val }) => {
    prop = sanitizer.toString(prop);

    if (lobbyData.has(prop) &&
        Object.getOwnPropertyDescriptor(self, prop).writable) {
      const san = userSanitizer[prop];

      if (san) {
        try {
          val = san(val, 20);
          self[prop] = val;
        }
        catch (err) {
          console.warn(err);
          self.socket.emit("ioError", err);
        }
      }
      else {
        self.socket.emit("ioError", `"${prop}" failed to validate.`);
      }
    }
  });


  return self;
};

module.exports = User;
