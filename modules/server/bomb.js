"use strict";


const Bomb = ({
  level,
  x, y,
  user,
  range,
  speed,
  timer
}) => {
  const explode = () => {
    ////
  };


  const self = (() => {
    const properties = Object.seal({
      get explode () { return explode; }
    });

    const p = properties;

    return p;
  })();


  return self;
};

module.exports = Bomb;
