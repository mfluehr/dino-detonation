const socket = require("socket.io");


const Lobby = (server) => {
  const self = {
    get io () { return io; },
    get lobbyIo () { return lobbyIo; },
    get rooms () { return rooms; },
    get users () { return users; },

    get addRoom () { return addRoom; },
    get addUser () { return addUser; },
    get removeRoom () { return removeRoom; },
    get removeUser () { return removeUser; }
  };


  const Room = require("./room"),
      User = require("./user"),
      io = socket(server),
      lobbyIo = io.of("/lobby"),
      maxRooms = 5,
      maxUsers = 40,
      rooms = new Map(),
      users = new Map();


  const addRoom = (name) => {
    if (rooms.size >= maxRooms) {
      return Promise.reject("The server can't hold any more rooms.");
    }

    try {
      rooms.forEach((room, roomId) => {
        if (room.name === name) {
          throw "A room with the specified name already exists.";
        }
      })
    }
    catch (err) {
      return Promise.reject(err);
    }

    const room = Room(name, self);
    rooms.set(room.id, room);
    lobbyIo.emit("addRoom", {roomId: room.id, name});
    return room.id;
  };

  const addUser = (socket) => {
    if (users.size >= maxUsers) {
      return Promise.reject("The server can't hold any more users.");
    }

    const user = User(socket, self);
    users.set(user.id, user);
    socket.broadcast.emit("joinRoom", user.id);
    return user.id;
  };

  const removeRoom = (roomId) => {
    rooms.delete(roomId);
    ////socket.broadcast.emit("removeRoom", roomId);
  };

  const removeUser = (userId) => {
    users.delete(userId);
  };


  lobbyIo.on("connection", function (socket) {
    Promise.resolve(addUser(socket)).catch((err) => {
      socket.emit("connectionError", err);
      socket.disconnect();
    });
  });


  return self;
};


module.exports = Lobby;
