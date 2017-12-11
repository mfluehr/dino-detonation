const Avatar = require("./avatar");

const User = (socket, lobby) => {
  const self = {
    get id () { return userId; },
    get avatar () { return avatar; },
    get email () { return email; },
    get name () { return name; },
    get room () { return room; },
    get socket () { return socket; },

    get reset () { return reset; },
    get joinRoom () { return joinRoom; }
  };

  const userId = socket.conn.id,
      avatar = Avatar(socket, self);

  let email = "noreply@example.com",
      name = "Anonymous",
      room;


  const reset = (data) => {
    ({email, name} = {...{email, name}, ...data});
  };

  const joinRoom = (room) => {
    room = room;
  };


  socket.on("addRoom", function (name, onerror) {
    Promise.resolve(lobby.addRoom(name))
        .then((roomId) => {
          lobby.rooms.get(roomId).addUser(userId);
        })
        .catch((err) => {
          onerror(err);
        });
  });

  socket.on("disconnect", function (reason) {
    if (room) {
      room.deleteUser(userId);
    }

    lobby.deleteUser(userId);

    console.log("User out:", name);
  });

  socket.on("joinRoom", function (roomId, onerror) {
    const room = lobby.rooms.get(roomId);

    if (room) {
      Promise.resolve(room.addUser(userId))
          .catch((err) => {
            onerror(err);
          });
    }
    else {
      onerror("The specified room doesn't exist.");
    }
  });

  socket.on("leaveRoom", function (onerror) {
    if (room) {
      room.deleteUser(userId);
    }
    else {
      //// TODO: don't let users crash the app with invalid messages
      onerror("You aren't in a room.");
    }
  });

  socket.on("login", function (data) {
    reset(data);

    console.log("User in:", name);
  });

  socket.on("startGame", function () {
    if (room) {
      room.startGame();
    }
  });


  return self;
};

module.exports = User;
