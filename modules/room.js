"use strict";

const Level = require("./level"),
      RoomOptions = require("./room-options"),
      Util = require("./util");


const Room = (name = "New Room", lobby, ownerId) => {
  const lobbyData = new Set(
      ["maxUsers", "name", "numUsers"]);
  const roomData = new Set(
      ["maxUsers", "name", "numUsers", "ownerId"]);

  const properties = {
    id: "r" + Date.now() + Math.random(),
    level: undefined,
    lobby,
    maxUsers: 4,
    name,
    numUsers: 0,
    ownerId,
    roomOptions: RoomOptions(),
    users: new Map(),

    get addUser () { return addUser; },
    get deleteUser () { return deleteUser; },
    get startGame () { return startGame; },


    get userData () {
      const roomUsers = [];
      p.users.forEach((user, userId) => {
        roomUsers.push(user.roomData);
      });
      return roomUsers;
    }
  };

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "lobbyData") {
        return {
          id: p.id,
          maxUsers: p.maxUsers,
          name: p.name,
          numUsers: p.numUsers,
          ownerId: p.ownerId
        };
      }
      else if (prop === "roomData") {
        return {
          id: p.id,
          //// level: p.level,
          // maxUsers: p.maxUsers,
          // name: p.name,
          // numUsers: p.numUsers,
          // ownerId: p.ownerId,
          //// roomOptions: p.roomOptions,
          users: p.userData
        };
      }

      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (obj[prop] !== val) {
        obj[prop] = val;

        const data = { id: p.id };
        data[prop] = val;

        if (lobbyData.has(prop)) {
          p.lobby.clients.emit("updateRoom", data);
        }

        if (roomData.has(prop)) {
          p.clients.emit("updateRoom", data);
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
    p.clients.emit("addUser", args[1].lobbyData);
    return p.users;
  };

  p.users.delete = (...args) => {
    Map.prototype.delete.apply(p.users, args);
    p.numUsers = p.users.size;
    p.clients.emit("deleteUser", args[0]);
    return p.users;
  };


  const addUser = (id) => {
    const user = p.lobby.users.get(id);

    if (p.users.get(id)) {
      throw "The user is already in the specified room.";
    }
    else if (user.room) {
      throw "The user is already in another room.";
    }
    else if (p.users.size >= p.maxUsers) {
      throw "The specified room is already full.";
    }

    if (p.level) {
      //// TODO: dynamic adding of avatars
      //// p.level.addUser(user);
    }

    p.users.set(id, user);
  };

  const deleteUser = (id) => {
    const user = p.lobby.users.get(id);

    if (p.level) {
      p.level.deleteUser(user);
    }

    if (id === p.ownerId) {
      //// TODO: change owner to next longest user
    }

    p.users.delete(id);

    if (p.users.size === 0) {
      p.lobby.deleteRoom(p.id);
    }
  };

  const startGame = () => {
    console.log("Start game!");
    p.level = Level(p.roomOptions.levels);
  };


  p.clients.on("connection", (roomSocket) => {
    const id = `u${roomSocket.conn.id}`,
          user = p.users.get(id);

    try {
      user.joinRoomComplete(roomSocket);
    }
    catch (err) {
      console.warn(err);
      roomSocket.emit("ioError", "The user is not in the specified room.");
      roomSocket.disconnect();
    }
  });


  return p;
};

module.exports = Room;
