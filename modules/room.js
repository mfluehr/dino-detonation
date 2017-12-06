const RoomOptions = require("./room-options");
const Level = require("./level");

const Room = (name, lobby) => {
  const self = {
    get id () { return roomId },
    get users () { return users; },
    get level () { return level; },
    get name () { return name; },

    get addUser () { return addUser; },
    get removeUser () { return removeUser; },
    get startGame () { return startGame; }
  };


  const roomId = Math.random(), ////
      roomIo = lobby.io.of("/room"),
      roomOptions = RoomOptions(),
      users = new Map();

  let maxUsers = 2,
      level,
      teams = false;


  const reset = (data) => {
    ({maxUsers, name, teams} =
        {...{maxUsers, name, teams}, ...data});
  }

  const addUser = (userId) => {
    const user = lobby.users.get(userId);

    if (user.room) {
      return Promise.reject("The user is already in another room.");
    }
    else if (users.get(userId)) {
      return Promise.reject("The user is already in the specified room.");
    }
    else if (users.size >= maxUsers) {
      return Promise.reject("The specified room is already full.");
    }

    user.room = self;
    users.set(userId, user);

    if (level) {
      level.addUser(user);
    }

    user.socket.emit("joinRoom");
  };

  const removeUser = (userId) => {
    const user = lobby.users.get(userId);
    user.socket.broadcast.emit("removeUser", userId);

    if (level) {
      level.removeUser(user);
    }

    users.delete(userId);

    if (users.size === 0) {
      lobby.removeRoom(roomId);
    }
  };

  const startGame = () => {
    level = Level(roomOptions.levels);

    users.forEach((user, userId) => {
      level.addUser(userId);
    });
  };


  roomIo.on("zzz", () => {
    ////
    console.log("ZZZZ!!!");
  });


  return self;
};

module.exports = Room;
