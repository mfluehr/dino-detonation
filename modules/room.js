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


  const self = (() => {
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
        return p.lobby.clients.in(p.id);
      },
      get lobbyData () {
        return {
          id: p.id,
          props: {
            id: p.id,
            maxUsers: p.maxUsers,
            name: p.name,
            numUsers: p.numUsers
          }
        };
      },
      get roomData () {
        return {
          id: p.id,
          props: {
            id: p.id,
            name: p.name,
            ownerId: p.ownerId
          }
        };
      },
      get syncData () {
        return {
          id: p.id,
          props: p.roomData.props,
          //// level: p.level.roomData,
          //// roomOptions: p.roomOptions,
          users: p.userData
        };
      },
      get userData () {
        const roomUsers = [];
        p.users.forEach((user, userId) => {
          roomUsers.push(user.roomData);
        });
        return roomUsers;
      }
    });

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (obj[prop] !== val) {
          obj[prop] = val;

          const data = {
            id: p.id,
            props: {
              [prop]: val
            }
          };

          if (prop in p.lobbyData.props) {
            p.lobby.clients.emit("updateLobbyRoom", data);
          }

          if (prop in p.roomData.props) {
            p.clients.emit("updateLocalRoom", data);
          }
        }

        return true;
      }
    });

    Util.freezeProperties(properties, ["id"]);

    p.users.set = function (id, user) {
      Map.prototype.set.apply(p.users, arguments);
      p.numUsers = p.users.size;
      p.clients.emit("addLocalUser", user.roomData);

      return p.users;
    };

    p.users.delete = function (id) {
      Map.prototype.delete.apply(p.users, arguments);
      p.numUsers = p.users.size;
      p.clients.emit("deleteLocalUser", id);
      return p.users;
    };

    return p;
  })();


  return self;
};

module.exports = Room;
