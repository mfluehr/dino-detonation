const TileType = ({
  defusesBombs = false,
  explodes = true,
  fatal = false,
  friction = 1,
  respawns = false,
  solid = false,
  triggersBombs = false,
  hp = Infinity,
  pickupOdds = 0,
  wear = Infinity
}) => {
  return {
    get defusesBombs () { return defusesBombs; },
    get explodes () { return explodes; },
    get fatal () { return fatal; },
    get friction () { return friction; },
    get respawns () { return respawns; },
    get solid () { return solid; },
    get triggersBombs () { return triggersBombs; },
    stats: {
      pickupOdds,
      hp,
      wear
    }
  };
};

const tileTypes = {
  "fire": TileType({
    fatal = true,
    triggersBombs = true
  }),
  "grass": TileType(),
  "marsh": TileType({
    defusesBombs = true
  }),
  "mine",
  "mirror",
  "oil",
  "pit",
  "steel",
  "tnt": TileType({
    explodes = true,
    solid = true
  }),
};

const Tile = (type = "grass") => {
  const stats = Object.assign({}, tileTypes[type].stats);


  const damage = (amount = 1) => {
    stats.hp -= amount;

    if (stats.hp <= 0) {
      //// destroy();
    }
  };

  const wear = (amount = 1) => {
    stats.wear -= amount;

    if (stats.wear <= 0) {
      //// destroy();
    }
  }


  return {
    damage,
    wear
  };
};

module.exports = Tile;
