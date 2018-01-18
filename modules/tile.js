"use strict";


const TileType = ({
  defusesBombs = false,
  explodes = true,
  fatal = false,
  // friction = 1,
  friction = Math.random(),
  respawns = false,
  solid = false,
  triggersBombs = false,
  hp = Infinity,
  pickupOdds = 0,
  wear = Infinity
} = {}) => {
  const self = {
    stats: {
      pickupOdds,
      hp,
      wear
    },

    get defusesBombs () { return defusesBombs; },
    get explodes () { return explodes; },
    get fatal () { return fatal; },
    get friction () { return friction; },
    get respawns () { return respawns; },
    get solid () { return solid; },
    get triggersBombs () { return triggersBombs; }
  };

  return self;
};

const Tile = (type = "grass") => {
  const damage = (amount = 1) => {
    self.hp -= amount;

    if (self.hp <= 0) {
      //// destroy();
    }
  };

  const wear = (amount = 1) => {
    self.wear -= amount;

    if (self.wear <= 0) {
      //// destroy();
    }
  }


  const self = (() => {
    const properties = Object.seal(Object.assign({
      type: tileTypes[type]
    }, tileTypes[type].stats));

    const p = properties;

    return p;
  })();


  return self;
};


const tileTypes = {
  "fire": TileType({
    fatal: true,
    triggersBombs: true
  }),
  "grass": TileType(),
  "marsh": TileType({
    defusesBombs: true
  }),
  "mine": TileType(),
  "mirror": TileType(),
  "oil": TileType(),
  "pit": TileType(),
  "steel": TileType(),
  "tnt": TileType({
    explodes: true,
    solid: true
  }),
};


module.exports = Tile;
