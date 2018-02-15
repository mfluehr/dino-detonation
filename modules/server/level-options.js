"use strict";

const util = require("./util");


const LevelOptions = () => {
  const self = Object.seal({
    name: "testLevel",
    timer: 300,
    avatars: {
      minCapacity: 4,
      maxCapacity: 10,
      minSpeedLimit: .2,
      maxSpeedLimit: .6
    },
    bombs: {
      range: 4,
      speedLimit: .8,
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
