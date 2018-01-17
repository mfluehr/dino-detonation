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

  const properties = Object.seal({
    get explode () { return explode; }
  });

  const self = properties;


  return self;
};

module.exports = Bomb;
