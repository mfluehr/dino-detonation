const Avatar = require("./avatar");
const randomName = require("./random-name");


const User = (lobbySocket, lobby) => {
  const self = {
    get id () { return userId; },
    get avatar () { return avatar; },
    get email () { return email; },
    get name () { return name; },
    get room () { return room; },
    get lobbySocket () { return lobbySocket; },

    get finishRoomConnection () { return finishRoomConnection; }
  };


  const userId = lobbySocket.conn.id,
        avatar = Avatar(lobbySocket, self);

  let email = "noreply@example.com",
      name = randomName(),
      room;


  const dropBomb = () => {
    //room.level.addBomb(userId);
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
      room.deleteUser(userId);
    });
  };

  const joinRoom = (roomId) => {
    const newRoom = lobby.rooms.get(roomId);

    if (newRoom) {
      newRoom.addUser(userId)
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

      lobby.users.forEach((user, userId) => {
        if (user.name === data.name) {
          throw "A user with the specified name already exists.";
        }
      })
    }
    catch (err) {
      return Promise.reject(err);
    }

    ({email, name} = {...{email, name}, ...data});

    lobby.lobbyIo.emit("editUser", { userId, name });
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
      room.deleteUser(userId);
    }

    lobby.deleteUser(userId);
  });

  lobbySocket.on("joinRoom", function (roomId) {
    joinRoom(roomId);
  });

  lobbySocket.on("leaveRoom", function () {
    if (room) {
      room.deleteUser(userId);
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


  return self;
};

module.exports = User;
