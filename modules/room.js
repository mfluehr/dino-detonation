"use strict";

const Level = require("./level"),
      LevelOptions = require("./level-options"),
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

    self.users.delete(id);
    user.room = undefined;

    if (self.users.size === 0) {
      self.lobby.deleteRoom(self.id);
    }
    else if (id === self.ownerId) {
      const it = self.users.keys();
      self.ownerId = it.next().value;
    }
  };

  const startGame = () => {
    self.level = Level(self.levelOptions, self);
  };


  const properties = Object.seal({
    id: "r" + Date.now() + Math.random(),
    level: undefined,
    lobby,
    maxUsers: 4,
    name,
    numUsers: 0,
    ownerId,
    levelOptions: LevelOptions(),
    users: new Map(),

    get addUser () { return addUser; },
    get deleteUser () { return deleteUser; },
    get startGame () { return startGame; },

    get clients () {
      return self.lobby.clients.in(self.id);
    },
    get lobbyData () {
      return {
        id: self.id,
        props: {
          id: self.id,
          maxUsers: self.maxUsers,
          name: self.name,
          numUsers: self.numUsers
        }
      };
    },
    get roomData () {
      return {
        id: self.id,
        props: {
          id: self.id,
          name: self.name,
          ownerId: self.ownerId
        }
      };
    },
    get syncData () {
      return {
        id: self.id,
        props: self.roomData.props,
        //// level: self.level.roomData,
        //// roomOptions: self.roomOptions,
        users: self.userData
      };
    },
    get userData () {
      const roomUsers = [];
      self.users.forEach((user, userId) => {
        roomUsers.push(user.roomData);
      });
      return roomUsers;
    }
  });

  const self = new Proxy(properties, {
    set: (obj, prop, val) => {
      if (obj[prop] !== val) {
        obj[prop] = val;

        const data = {
          id: self.id,
          props: {
            [prop]: val
          }
        };

        if (prop in self.lobbyData.props) {
          self.lobby.clients.emit("updateLobbyRoom", data);
        }

        if (prop in self.roomData.props) {
          self.clients.emit("updateLocalRoom", data);
        }
      }

      return true;
    }
  });

  Util.freezeProperties(properties, ["id"]);

  self.users.set = function (id, user) {
    Map.prototype.set.apply(self.users, arguments);
    self.numUsers = self.users.size;
    self.clients.emit("addLocalUser", user.roomData);

    return self.users;
  };

  self.users.delete = function (id) {
    Map.prototype.delete.apply(self.users, arguments);
    self.numUsers = self.users.size;
    self.clients.emit("deleteLocalUser", id);
    return self.users;
  };


  return self;
};

module.exports = Room;
