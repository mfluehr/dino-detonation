"use strict";

const socket = require("socket.io");


const Lobby = (server) => {
  const self = {
    get io () { return io; },
    get clients () { return clients; },
    get rooms () { return rooms; },
    get users () { return users; },

    get addRoom () { return addRoom; },
    get addUser () { return addUser; },
    get deleteRoom () { return deleteRoom; },
    get deleteUser () { return deleteUser; }
  };


  const Room = require("./room"),
        User = require("./user"),
        io = socket(server),
        clients = io.of("/lobby"),
        maxRooms = 5,
        maxUsers = 40,
        rooms = new Map(),
        users = new Map();


  const addRoom = (name = "", user) => {
    if (user.room) {
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
    })

    const newRoom = Room(name, self);
    rooms.set(newRoom.id, newRoom);
    clients.emit("addRoom", {
      id: newRoom.id,
      name: newRoom.name
    });

    return newRoom.id;
  };

  const addUser = (lobbySocket) => {
    if (users.size >= maxUsers) {
      throw "The server can't hold any more users.";
    }

    const newUser = User(lobbySocket, self);
    users.set(newUser.id, newUser);

    //// TODO: send all data together?
    rooms.forEach((room, roomId) => {
      lobbySocket.emit("addRoom", {
        id: room.id,
        name: room.name
      });
    });

    users.forEach((user, userId) => {
      lobbySocket.emit("addUser", user);
    });

    lobbySocket.broadcast.emit("addUser", newUser);
  };

  const deleteRoom = (roomId) => {
    rooms.delete(roomId);
  };

  const deleteUser = (id) => {
    users.delete(id);
    clients.emit("deleteUser", { id });
  };


  clients.on("connection", function (lobbySocket) {
    try {
      addUser(lobbySocket);
    }
    catch (err) {
      console.warn(err);
      lobbySocket.emit("ioError", err);
      lobbySocket.disconnect();
    }
  });


  return self;
};


module.exports = Lobby;
