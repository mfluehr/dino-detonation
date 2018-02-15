"use strict";


const Pickup = () => {
  const self = (() => {
    const properties = Object.seal({
      type: "",
      odds: 1
    });

    const p = properties;

    return p;
  })();


  return self;
};


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


module.exports = Pickup;
