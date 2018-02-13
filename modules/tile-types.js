"use strict";


const TileType = ({
  name = "unknown",
  defusesBombs = false,
  explodes = false,
  fatal = false,
  friction = 1,
  respawns = false,
  solid = false,
  triggersBombs = false,
  hp = Infinity,
  pickupOdds = 0,
  wear = Infinity
} = {}) => {
  const self = (() => {
    const properties = Object.freeze({
      name,
      defusesBombs,
      explodes,
      fatal,
      friction,
      respawns,
      solid,
      triggersBombs,
      stats: {
        hp,
        pickupOdds,
        wear
      }
    });

    const p = properties;

    return p;
  })();

  return self;
};


const tileTypes = {
  0: TileType({
    name: "grass"
  }),
  1: TileType({
    name: "rock",
    hp: 1,
    solid: true
  }),
  2: TileType({
    name: "fire",
    fatal: true,
    triggersBombs: true
  }),
  3: TileType({
    name: "marsh",
    defusesBombs: true
  }),
  4: TileType({
    name: "mirror",
    solid: true
  }),
  5: TileType({
    name: "oil",
    friction: 0
  }),
  6: TileType({
    name: "pit",
    defusesBombs: true,
    fatal: true
  }),
  7: TileType({
    name: "steel",
    solid: true
  }),
  8: TileType({
    name: "TNT",
    explodes: true,
    hp: 1,
    solid: true
  }),
  9: TileType({
    name: "fan",
    solid: true
  })
};


module.exports = tileTypes;
