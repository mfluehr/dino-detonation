const Bomb = require("./bomb");
//// const Pickup = require("./pickup");
//// const Tile = require("./tile");

const tileWidth = 80;
const tileHeight = 80;

const maps = {
  testLevel: {
    tiles: [
      [0,0,0,0,0,0,9,0,0,0,0,0,0],
      [0,0,0,0,0,0,9,0,0,0,0,0,0],
      [0,0,0,9,0,0,9,0,0,0,0,0,0],
      [0,9,9,9,0,0,9,0,0,0,0,0,0],
      [0,0,0,0,0,9,9,9,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,9,0,0,0,0,9,9,9,9],
      [0,0,0,0,9,0,0,0,0,0,9,9,9],
      [0,0,0,0,9,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,9,9,9,0,0,0,0],
      [0,0,0,0,0,0,9,9,9,0,0,0,0],
      [0,0,0,0,0,9,9,9,0,0,0,0,0],
      [0,0,0,0,0,9,9,9,0,0,0,0,0]
    ],
    homes: {
      1: [0, 0],
      2: [13, 13],
      3: [13, 0],
      4: [0, 13]
    }
  }
};


const Level = ({
  name,
  room
}) => {
  const self = {
    get reset () { return reset; },
    get addBomb () { return addBomb; },
    get addUser () { return resetUser; },
    get removeUser () { return removeUser; }
  };


  let map = maps[name],
      tiles = map.tiles,
      homes = map.players;
  let avatars,
      bombs,
      pickups;


  const reset = (data) => {
    ({name} = {...{name}, ...data});
  };

  const addBomb = (userId, x, y) => {
    x = tileX(x);
    y = tileY(y);

    bomb = Bomb({
      level = self,
      x, y,
      userId,
      range,
      speed,
      timer
    });




    return true;
  };

  const addUser = (userId) => {
    room.users.get(userId).avatar.reset(room.roomOptions.avatars);
  };

  const removeUser = (userId) => {
    ////
  };

  const tileX = (x) => {
    return Math.round(x / tileWidth);
  };

  const tileY = (y) => {
    return Math.round(y / tileHeight);
  };


  return self;
};

module.exports = Level;
