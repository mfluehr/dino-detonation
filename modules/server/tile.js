"use strict";

const tileTypes = require("./tile-types");


const Tile = (num) => {
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
      type: tileTypes[num],

      get localData () {
        return {
          hp: p.hp,
          type: num,
          solid: p.type.solid
        };
      }
    }, tileTypes[num].stats));

    const p = properties;

    return p;
  })();

  return self;
};


module.exports = Tile;
