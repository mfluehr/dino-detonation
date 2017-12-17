"use strict";

const Level = require("./level"),
      RoomOptions = require("./room-options"),
      Util = require("./util");


const Room = (name = "New Room", lobby, owner) => {
  const shared = new Set(["id", "maxUsers", "name", "numUsers"]);

  const properties = {
    id: "r" + Date.now() + Math.random(),
    level: undefined,
    lobby,
    maxUsers: 4,
    name,
    numUsers: 0,
    owner,
    roomOptions: RoomOptions(),
    users: new Map(),

    get addUser () { return addUser; },
    get deleteUser () { return deleteUser; },
    get startGame () { return startGame; }
  };

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "shared") {
        return {
          id: p.id,
          maxUsers: p.maxUsers,
          name: p.name,
          numUsers: p.numUsers
        };
      }

      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (obj[prop] !== val) {
        obj[prop] = val;

        const data = { id: p.id };
        data[prop] = val;

        if (shared.has(prop)) {
          p.lobby.clients.emit("updateRoom", data);
        }
      }

      return true;
    }
  });

  properties.clients = p.lobby.io.of(`/${p.id}`);

  Object.seal(properties);
  Util.freezeProperties(properties, ["id"]);

  p.users.set = (...args) => {
    Map.prototype.set.apply(p.users, args);
    p.numUsers = p.users.size;
    return p.users;
  };

  p.users.delete = (...args) => {
    Map.prototype.delete.apply(p.users, args);
    p.numUsers = p.users.size;
    return p.users;
  };


  const addUser = (userId) => {
    const newUser = p.lobby.users.get(userId);

    if (p.users.get(userId)) {
      throw "The user is already in the specified room.";
    }
    else if (newUser.room) {
      throw "The user is already in another room.";
    }
    else if (p.users.size >= p.maxUsers) {
      throw "The specified room is already full.";
    }

    if (p.level) {
      //// TODO: dynamic adding of avatars
      //// p.level.addUser(newUser);
    }

    p.users.set(userId, newUser);
  };

  const deleteUser = (userId) => {
    const user = p.lobby.users.get(userId);

    if (user) {
      if (p.level) {
        p.level.deleteUser(user);
      }

      p.users.delete(userId);

      if (p.users.size === 0) {
        p.lobby.deleteRoom(p.id);
      }
    }
  };

  const startGame = () => {
    console.log("Start game!");
    p.level = Level(p.roomOptions.levels);
  };


  p.clients.on("connection", (roomSocket) => {
    const userId = roomSocket.conn.id,
          user = p.users.get(userId);

    try {
      user.finishRoomConnection(roomSocket);
    }
    catch (err) {
      console.warn(err);
      roomSocket.emit("ioError", "Connection to room failed.");
      roomSocket.disconnect();
    }
  });


  return p;
};

module.exports = Room;
