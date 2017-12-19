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

    const newRoom = Room(name, p, owner.id);
    rooms.set(newRoom.id, newRoom);

    return newRoom;
  };

  const addUser = (lobbySocket) => {
    if (users.size >= maxUsers) {
      throw "The server can't hold any more users.";
    }

    const newUser = User(lobbySocket, p),
          lobbyRooms = [],
          lobbyUsers = [];

    rooms.forEach((room, roomId) => {
      lobbyRooms.push(room.lobbyData);
    });
    lobbySocket.emit("addRoom", ...lobbyRooms);

    users.forEach((user, userId) => {
      lobbyUsers.push(user.lobbyData);
    });
    lobbySocket.emit("addUser", ...lobbyUsers);

    users.set(newUser.id, newUser);
    lobbySocket.emit("updateUser", newUser.privateData);
    lobbySocket.emit("loadUser", newUser.id);

    return newUser;
  };

  const deleteRoom = (roomId) => {
    rooms.delete(roomId);
  };

  const deleteUser = (userId) => {
    users.delete(userId);
  };


  const p = {
    get io () { return io; },
    get clients () { return clients; },
    get rooms () { return rooms; },
    get users () { return users; },

    get addRoom () { return addRoom; },
    get addUser () { return addUser; },
    get deleteRoom () { return deleteRoom; },
    get deleteUser () { return deleteUser; }
  };

  const io = socket(server),
        clients = io.of("/lobby"),
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


  clients.on("connection", (lobbySocket) => {
    try {
      addUser(lobbySocket);
    }
    catch (err) {
      console.warn(err);
      lobbySocket.emit("ioError", err);
      lobbySocket.disconnect();
    }
  });


  return p;
};


module.exports = Lobby;
