const Avatar = require("./avatar");
const randomName = require("./random-name");


const User = (lobbySocket, lobby) => {
  const self = {
    get props () { return props; },
    // get avatar () { return avatar; },
    // get lobbySocket () { return lobbySocket; },
    // get room () { return room; },

    get finishRoomConnection () { return finishRoomConnection; }
  };


  const avatar = Avatar(lobbySocket, self);

  let room = {};




  const props = {
    id: lobbySocket.conn.id,
    email: "noreply@example.com",
    name: randomName(),

    avatar,
    // lobbySocket,
    room
  };

  const locked = new Set(["id"]),
        shared = new Set(["id", "name"]);

  const p = new Proxy(props, {
    get: function(obj, prop) {
      return obj[prop];
    },
    set: function(obj, prop, val) {
      if (locked.has(prop)) {
        return false;
      }
      else if (obj[prop] !== val) {
        obj[prop] = val;

        if (shared.has(prop)) {
          lobby.clients.emit("updateUser", { id: p.id, prop, val });
        }
        else {
          lobbySocket.emit("updateUser", { id: p.id, prop, val });
        }

        return true;
      }

      return false;
    }
  });





  const dropBomb = () => {
    //room.level.addBomb(id);
    console.log("Drop");
  };

  const halt = () => {
    // console.log("Halt!");
  };

  const finishRoomConnection = (roomSocket, room) => {
    roomSocket.on("dropBomb", function () {
      dropBomb();
    });

    roomSocket.on("halt", function () {
      halt();
    });

    roomSocket.on("disconnect", function (reason) {
      room.deleteUser(id);
    });
  };

  const joinRoom = (roomId) => {
    const newRoom = lobby.rooms.get(roomId);

    if (newRoom) {
      newRoom.addUser(id)
          .then(() => {
            room = newRoom;
          })
          .catch((err) => {
            lobbySocket.emit("ioError", err);
          });
    }
    else {
      lobbySocket.emit("ioError", "The specified room doesn't exist.");
    }
  };

  const login = (data) => {
    try {
      if (!data.name) {
        throw "The user must have a name.";
      }

      lobby.users.forEach((user, id) => {
        if (user.name === data.name) {
          throw "A user with the specified name already exists.";
        }
      })
    }
    catch (err) {
      return Promise.reject(err);
    }

    //// TODO: only allow for some properties
    Object.assign(p, data);

    return Promise.resolve();
  };


  lobbySocket.on("addRoom", function (name) {
    lobby.addRoom(name, self)
        .then((roomId) => {
          joinRoom(roomId);
        })
        .catch((err) => {
          lobbySocket.emit("ioError", err);
        });
  });

  lobbySocket.on("disconnect", function (reason) {
    if (room) {
      //// room.deleteUser(p.id);
    }

    lobby.deleteUser(p.id);
  });

  lobbySocket.on("joinRoom", function (roomId) {
    joinRoom(roomId);
  });

  lobbySocket.on("leaveRoom", function () {
    if (room) {
      room.deleteUser(id);
    }
    else {
      lobbySocket.emit("ioError", "The user isn't in a room.");
    }
  });

  lobbySocket.on("login", function (data) {
    login(data)
        .catch((err) => {
          lobbySocket.emit("ioError", err);
        });
  });

  lobbySocket.on("startGame", function () {
    if (room) {
      room.startGame();
    }
    else {
      lobbySocket.emit("ioError", "The user isn't in a room.");
    }
  });


  return p;
};

module.exports = User;
