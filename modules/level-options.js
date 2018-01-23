"use strict";

const util = require("./util");


const LevelOptions = () => {
  const self = Object.seal({
    name: "testLevel",
    timer: 300,
    avatars: {
      minCapacity: 4,
      maxCapacity: 10,
      minSpeed: .4,
      maxSpeed: 1.2
    },
    bombs: {
      range: 4,
      speed: .8,
      timer: 2
    },
    pickups: {
      diseases: true,
      timer: 10
    }
  });

  return self;
};

module.exports = LevelOptions;
