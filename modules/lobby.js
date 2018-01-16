"use strict";

const socket = require("socket.io"),
      Room = require("./room"),
      User = require("./user");


const Lobby = (server) => {
  const addRoom = (name = "", owner) => {
    if (owner.room) {
      throw "The user can't create a room while in another room.";
    }
    else if (rooms.size >= maxRooms) {
      throw "The server can't hold any more rooms.";
    }
    else if (name.length === 0) {
      throw "The room must have a name.";
    }

    rooms.forEach((room, roomId) => {
      if (room.name === name) {
        throw "A room with the specified name already exists.";
      }
    });

    const newRoom = Room(name, self, owner.id);
    rooms.set(newRoom.id, newRoom);

    return newRoom;
  };

  const addUser = (socket) => {
    if (users.size >= maxUsers) {
      throw "The server can't hold any more users.";
    }

    const newUser = User(socket, self),
          lobbyRooms = [],
          lobbyUsers = [];

    rooms.forEach((room, roomId) => {
      lobbyRooms.push(room.lobbyData);
    });
    socket.emit("addRoom", ...lobbyRooms);

    users.forEach((user, userId) => {
      lobbyUsers.push(user.lobbyData);
    });
    socket.emit("addUser", ...lobbyUsers);

    users.set(newUser.id, newUser);
    socket.emit("updateLobbyUser", newUser.personalData);
    socket.emit("loadLocalUser", newUser.id);

    return newUser;
  };

  const deleteRoom = (roomId) => {
    rooms.delete(roomId);
  };

  const deleteUser = (userId) => {
    users.delete(userId);
  };


  const self = {
    get clients () { return clients; },
    get rooms () { return rooms; },
    get users () { return users; },

    get addRoom () { return addRoom; },
    get addUser () { return addUser; },
    get deleteRoom () { return deleteRoom; },
    get deleteUser () { return deleteUser; }
  };

  const io = socket(server),
        clients = io,
        maxRooms = 5,
        maxUsers = 40,
        rooms = new Map(),
        users = new Map();

  rooms.set = (...args) => {
    clients.emit("addRoom", args[1].lobbyData);
    return Map.prototype.set.apply(rooms, args);
  };

  rooms.delete = (...args) => {
    clients.emit("deleteRoom", args[0]);
    return Map.prototype.delete.apply(rooms, args);
  };

  users.set = (...args) => {
    clients.emit("addUser", args[1].lobbyData);
    return Map.prototype.set.apply(users, args);
  };

  users.delete = (...args) => {
    clients.emit("deleteUser", args[0]);
    return Map.prototype.delete.apply(users, args);
  };


  clients.on("connection", (socket) => {
    try {
      addUser(socket);
    }
    catch (err) {
      console.warn(err);
      socket.emit("ioError", err);
      socket.disconnect();
    }
  });


  return self;
};


module.exports = Lobby;
