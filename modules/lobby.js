"use strict";

const Room = require("./room"),
      socket = require("socket.io"),
      User = require("./user");


const Lobby = (server) => {
  const listen = () => {
    self.clients.on("connection", (socket) => {
      try {
        loadUser(socket);
      }
      catch (err) {
        console.warn(err);
        socket.emit("ioError", err);
        socket.disconnect();
      }
    });
  };

  const loadRoom = (name = "", owner) => {
    if (owner.room) {
      throw "The user can't create a room while in another room.";
    }
    else if (self.rooms.size >= self.maxRooms) {
      throw "The server can't hold any more rooms.";
    }
    else if (name.length === 0) {
      throw "The room must have a name.";
    }

    self.rooms.forEach((room, roomId) => {
      if (room.name === name) {
        throw "A room with the specified name already exists.";
      }
    });

    const newRoom = Room(name, self, owner.id);
    self.rooms.set(newRoom.id, newRoom);

    return newRoom;
  };

  const loadUser = (socket) => {
    if (self.users.size >= self.maxUsers) {
      throw "The server can't hold any more users.";
    }

    const newUser = User(socket, self);
    self.users.set(newUser.id, newUser);

    return newUser;
  };

  const unloadRoom = (roomId) => {
    self.rooms.delete(roomId);
  };

  const unloadUser = (userId) => {
    self.users.delete(userId);
  };


  const self = (() => {
    const properties = Object.seal({
      clients: socket(server),
      maxRooms: 5,
      maxUsers: 40,
      rooms: new Map(),
      users: new Map(),

      get loadRoom () { return loadRoom; },
      get loadUser () { return loadUser; },
      get unloadRoom () { return unloadRoom; },
      get unloadUser () { return unloadUser; },

      get lobbyData () {
        const data = {
          rooms: p.roomData,
          users: p.userData
        };

        return data;
      },
      get roomData () {
        const roomData = [];
        p.rooms.forEach((room, roomId) => {
          roomData.push(room.lobbyData);
        });
        return roomData;
      },
      get userData () {
        const userData = [];
        p.users.forEach((user, userId) => {
          userData.push(user.lobbyData);
        });
        return userData;
      }
    });

    const p = properties;

    p.rooms.set = function (id, room) {
      p.clients.emit("loadLobbyRoom", room.lobbyData);
      return Map.prototype.set.apply(this, arguments);
    };

    p.rooms.delete = function (id) {
      p.clients.emit("unloadLobbyRoom", id);
      return Map.prototype.delete.apply(this, arguments);
    };

    p.users.set = function (id, user) {
      user.socket.emit("loadLobby", p.lobbyData);
      p.clients.emit("loadLobbyUser", user.lobbyData);
      user.socket.emit("syncLobbyUser", user.personalData);
      user.socket.emit("loadPersonalUser", user.id);
      return Map.prototype.set.apply(this, arguments);
    };

    p.users.delete = function (id) {
      p.clients.emit("unloadLobbyUser", id);
      return Map.prototype.delete.apply(this, arguments);
    };

    return p;
  })();


  listen();


  return self;
};


module.exports = Lobby;
