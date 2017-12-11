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


  const roomId = Math.random(),  //// TODO: better way
      roomIo = lobby.io.of("/room"),
      roomOptions = RoomOptions(),
      users = new Map();

  let maxUsers = 2,
      level,
      teams = false;


  const reset = (data) => {
    ({maxUsers, name, teams} = {...{maxUsers, name, teams}, ...data});
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
      // TODO: dynamic adding of avatars
      ////level.addUser(user);
    }

    user.socket.emit("joinRoom");
  };

  const deleteUser = (userId) => {
    const user = lobby.users.get(userId);
    user.socket.broadcast.emit("deleteUser", userId);

    if (level) {
      level.deleteUser(user);
    }

    users.delete(userId);

    if (users.size === 0) {
      lobby.deleteRoom(roomId);
    }
  };

  const startGame = () => {
    level = Level(roomOptions.levels);
  };


  roomIo.on("zzz", () => {
    ////
    console.log("ZZZZ!!!");
  });


  return self;
};

module.exports = Room;
