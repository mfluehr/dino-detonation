const RoomOptions = require("./room-options");
const Level = require("./level");


const Room = (name = "New Room", lobby) => {
  const self = {
    get id () { return roomId },
    get users () { return users; },
    get level () { return level; },
    get name () { return name; },

    get addUser () { return addUser; },
    get deleteUser () { return deleteUser; },
    get startGame () { return startGame; }
  };


  const roomId = "r" + Date.now() + Math.random(),
        roomIo = lobby.io.of(`/${roomId}`),
        roomOptions = RoomOptions(),
        users = new Map();

  let maxUsers = 2,
      level,
      teams = false;


  const reset = (data) => {
    ({maxUsers, name, teams} = {...{maxUsers, name, teams}, ...data});
  }

  const addUser = (userId) => {
    const newUser = lobby.users.get(userId);

    try {
      if (users.get(userId)) {
        throw "The user is already in the specified room.";
      }
      else if (newUser.room) {
        throw "The user is already in another room.";
      }
      else if (users.size >= maxUsers) {
        throw "The specified room is already full.";
      }
    }
    catch (err) {
      return Promise.reject(err);
    }

    if (level) {
      // TODO: dynamic adding of avatars
      ////level.addUser(newUser);
    }

    users.set(userId, newUser);
    newUser.lobbySocket.emit("joinRoom", {
      roomId
    });

    return Promise.resolve(userId);
  };

  const deleteUser = (userId) => {
    const user = lobby.users.get(userId);

    if (user) {
      // user.lobbySocket.broadcast.emit("deleteUser", userId);

      if (level) {
        level.deleteUser(user);
      }

      users.delete(userId);

      if (users.size === 0) {
        lobby.deleteRoom(roomId);
      }
    }
  };

  const startGame = () => {
    console.log("Start game!");
    level = Level(roomOptions.levels);
  };



  roomIo.on("connection", function (roomSocket) {
    const userId = roomSocket.conn.id,
          user = users.get(userId);

    try {
      user.finishRoomConnection(roomSocket, self);
    }
    catch (err) {
      roomSocket.emit("connectionError",
          "Connection to room failed.");
      roomSocket.disconnect();
    }
  });


  return self;
};

module.exports = Room;
