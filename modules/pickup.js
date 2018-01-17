"use strict";


const pickupTypes = {
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
  const properties = Object.seal({
    type: "",
    odds: 1
  });

  const self = properties;


  return self;
};

module.exports = Pickup;
