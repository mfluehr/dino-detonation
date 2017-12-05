const Avatar = require("./avatar");

const User = (socket, lobby) => {
  const self = {
    get id () { return userId; },
    get avatar () { return avatar; },
    get email () { return email; },
    get name () { return name; },
    get room () { return room; },
    get socket () { return socket; },

    get reset () { return reset; }
  };


  const userId = socket.id,
      avatar = Avatar(socket, self);

  let email = "noreply@example.com",
      name = "Anonymous",
      room;


  const reset = (data) => {
    ({email, name} = {...{email, name}, ...data});
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
      room.removeUser(userId);
    }

    lobby.removeUser(userId);

    console.log("User out:", name);
  });

  socket.on("joinRoom", function (roomId, onerror) {
    const tempRoom = lobby.rooms.get(roomId);

    if (tempRoom) {
      Promise.resolve(tempRoom.addUser(userId))
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
      room.removeUser(userId);
    }
    else {
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
