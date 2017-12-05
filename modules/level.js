const Bomb = require("./bomb");

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
  timer
}) => {
  const self = {
    get reset () { return reset; },
    get addBomb () { return addBomb; },
    get removeUser () { return removeUser; },
    get resetUser () { return resetUser; }
  };


  let map = maps[name],
      tiles = map.tiles,
      homes = map.players;
  let bombs = [],
      pickups = [],
      running = false;


  const reset = (data) => {
    ({name} = {...{name}, ...data});
  };

  const addBomb = (userId, x, y) => {
    let tileX = Math.round(x / tileWidth);
        tileY = Math.round(y / tileHeight);

    console.log(tileX, tileY);

    return true;
  };

  const removeUser = (userId) => {
    ////
  };

  const resetUser = (userId) => {
    ////
  };


  return self;
};

module.exports = Level;
