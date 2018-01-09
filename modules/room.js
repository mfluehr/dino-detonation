"use strict";

const Level = require("./level"),
      RoomOptions = require("./room-options"),
      Util = require("./util");


const Room = (name = "New Room", lobby, ownerId) => {
  const addUser = (id) => {
    const user = self.lobby.users.get(id);

    if (self.users.get(id)) {
      throw "The user is already in the specified room.";
    }
    else if (user.room) {
      throw "The user is already in another room.";
    }
    else if (self.users.size >= self.maxUsers) {
      throw "The specified room is already full.";
    }

    if (self.level) {
      //// TODO: dynamic adding of avatars
      //// self.level.addUser(user);
    }

    self.users.set(id, user);
    user.room = self;
  };

  const deleteUser = (id) => {
    const user = self.lobby.users.get(id);

    if (self.level) {
      self.level.deleteUser(user);
    }

    if (id === self.ownerId) {
      //// TODO: change owner to next longest user
    }

    self.users.delete(id);
    user.room = undefined;

    if (self.users.size === 0) {
      self.lobby.deleteRoom(self.id);
    }
  };

  const startGame = () => {
    console.log("Start game!");
    self.level = Level(self.roomOptions.levels);
  };


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
      self.users.forEach((user, userId) => {
        roomUsers.push(user.roomData);
      });
      return roomUsers;
    }
  };

  const self = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "lobbyData") {
        return {
          id: self.id,
          maxUsers: self.maxUsers,
          name: self.name,
          numUsers: self.numUsers,
          ownerId: self.ownerId
        };
      }
      else if (prop === "roomData") {
        return {
          id: self.id,
          //// level: self.level,
          //// roomOptions: self.roomOptions,
          users: self.userData
        };
      }

      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (obj[prop] !== val) {
        obj[prop] = val;

        const data = { id: self.id };
        data[prop] = val;

        if (lobbyData.has(prop)) {
          self.lobby.clients.emit("updateRoom", data);
        }

        if (roomData.has(prop)) {
          self.clients.emit("updateLocalRoom", data);
        }
      }

      return true;
    }
  });

  properties.clients = self.lobby.clients.in(self.id);

  Object.seal(properties);
  Util.freezeProperties(properties, ["id"]);

  self.users.set = (...args) => {
    Map.prototype.set.apply(self.users, args);
    self.numUsers = self.users.size;
    self.clients.emit("addRoomUser", args[1].lobbyData);
    return self.users;
  };

  self.users.delete = (...args) => {
    Map.prototype.delete.apply(self.users, args);
    self.numUsers = self.users.size;
    self.clients.emit("deleteRoomUser", args[0]);
    return self.users;
  };


  return self;
};

module.exports = Room;
