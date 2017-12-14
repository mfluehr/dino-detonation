"use strict";

const Level = require("./level"),
      RoomOptions = require("./room-options"),
      Util = require("./util");


const Room = (name = "New Room", lobby, owner) => {
  const properties = {
    id: "r" + Date.now() + Math.random(),
    maxUsers: 4,
    name,

    get addUser () { return addUser; },
    get deleteUser () { return deleteUser; },
    get startGame () { return startGame; }
  };

  Object.seal(properties);
  Util.freezeProperties(properties, ["id"]);

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "shared") {
        return {
          id: p.id,
          maxUsers: p.maxUsers,
          name: p.name
        };
      }

      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (obj[prop] !== val) {
        obj[prop] = val;
        lobby.clients.emit("updateRoom", { id: p.id, prop, val });
      }

      return true;
    }
  });

  const clients = lobby.io.of(`/${p.id}`),
        roomOptions = RoomOptions(),
        users = new Map();
  let level;


  const addUser = (userId) => {
    const newUser = lobby.users.get(userId);

    if (users.get(userId)) {
      throw "The user is already in the specified room.";
    }
    else if (newUser.room) {
      throw "The user is already in another room.";
    }
    else if (users.size >= p.maxUsers) {
      throw "The specified room is already full.";
    }

    if (p.level) {
      //// TODO: dynamic adding of avatars
      //// p.level.addUser(newUser);
    }

    users.set(userId, newUser);
  };

  const deleteUser = (userId) => {
    const user = lobby.users.get(userId);

    if (user) {
      // user.lobbySocket.broadcast.emit("deleteUser", userId);

      if (p.level) {
        p.level.deleteUser(user);
      }

      users.delete(userId);

      if (users.size === 0) {
        lobby.deleteRoom(id);
      }
    }
  };

  const startGame = () => {
    console.log("Start game!");
    p.level = Level(roomOptions.levels);
  };


  clients.on("connection", function (roomSocket) {
    const userId = roomSocket.conn.id,
          user = users.get(userId);

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
