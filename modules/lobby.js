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
    try {
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
    }
    catch (err) {
      return Promise.reject(err);
    }

    const newRoom = Room(name, self);
    rooms.set(newRoom.id, newRoom);
    clients.emit("addRoom", {
      id: newRoom.id,
      name: newRoom.name
    });

    return Promise.resolve(newRoom.id);
  };

  const addUser = (lobbySocket) => {
    try {
      if (users.size >= maxUsers) {
        throw "The server can't hold any more users.";
      }
    }
    catch (err) {
      return Promise.reject(err);
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

    return Promise.resolve(newUser.id);
  };

  const deleteRoom = (roomId) => {
    rooms.delete(roomId);
  };

  const deleteUser = (id) => {
    users.delete(id);
    clients.emit("deleteUser", { id });
  };


  clients.on("connection", function (lobbySocket) {
    addUser(lobbySocket)
        .catch((err) => {
          lobbySocket.emit("connectionError", err);
          lobbySocket.disconnect();
        });
  });


  return self;
};


module.exports = Lobby;
