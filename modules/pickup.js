"use strict";

const types = {
  bonus: [
    "boostCapacity",
    "boostExplosion",
    "boostSpeed",
    "dynamite",
    "kickBombs"
  ],
  disease: [
    "autoBomb",
    "dropBonuses",
    "fastExplode",
    "kickBlocks",
    "oilTrail",
    "shield",
    "slowMotion",
    "touchOfDeath",
    "walkBackwards",
    "walkThrough"
  ],
  global: [
    "boulders",
    "disintegrate",
    "fog",
    "rainBombs",
    "rainDiseases",
    "rainStones",
    "slowMotion"
  ]
};

const Pickup = () => {
  let type,
      odds;
};

module.exports = Pickup;
