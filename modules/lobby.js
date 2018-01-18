"use strict";

const socket = require("socket.io"),
      Room = require("./room"),
      User = require("./user");


const Lobby = (server) => {
  const addRoom = (name = "", owner) => {
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

  const addUser = (socket) => {
    if (self.users.size >= self.maxUsers) {
      throw "The server can't hold any more users.";
    }

    const newUser = User(socket, self);
    self.users.set(newUser.id, newUser);

    return newUser;
  };

  const deleteRoom = (roomId) => {
    self.rooms.delete(roomId);
  };

  const deleteUser = (userId) => {
    self.users.delete(userId);
  };

  const listen = () => {
    self.clients.on("connection", (socket) => {
      try {
        addUser(socket);
      }
      catch (err) {
        console.warn(err);
        socket.emit("ioError", err);
        socket.disconnect();
      }
    });
  };


  const self = (() => {
    const properties = Object.seal({
      clients: socket(server),
      maxRooms: 5,
      maxUsers: 40,
      rooms: new Map(),
      users: new Map(),

      get addRoom () { return addRoom; },
      get addUser () { return addUser; },
      get deleteRoom () { return deleteRoom; },
      get deleteUser () { return deleteUser; }
    });

    const p = properties;

    p.rooms.set = function (id, room) {
      p.clients.emit("addRoom", room.lobbyData);
      return Map.prototype.set.apply(p.rooms, arguments);
    };

    p.rooms.delete = function (id) {
      p.clients.emit("deleteRoom", id);
      return Map.prototype.delete.apply(p.rooms, arguments);
    };

    p.users.set = function (id, user) {
      const lobbyRooms = [],
            lobbyUsers = [];

      p.rooms.forEach((room, roomId) => {
        lobbyRooms.push(room.lobbyData);
      });
      user.socket.emit("addRoom", ...lobbyRooms);

      p.users.forEach((user, userId) => {
        lobbyUsers.push(user.lobbyData);
      });
      user.socket.emit("addUser", ...lobbyUsers);

      p.clients.emit("addUser", user.lobbyData);
      user.socket.emit("updateLobbyUser", user.personalData);
      user.socket.emit("loadPersonalUser", user.id);

      return Map.prototype.set.apply(p.users, arguments);
    };

    p.users.delete = function (id) {
      p.clients.emit("deleteUser", id);
      return Map.prototype.delete.apply(p.users, arguments);
    };

    return p;
  })();


  listen();


  return self;
};


module.exports = Lobby;
