"use strict";


const util = {
  degToDirection: (deg) => {
    const angleDirections = {
      270: util.DIRECTIONS.top,
      0: util.DIRECTIONS.right,
      90: util.DIRECTIONS.bottom,
      180: util.DIRECTIONS.left
    };

    deg %= 360;
    deg += 360;
    deg = util.toInterval(deg, 90);
    deg %= 360;

    return angleDirections[deg];
  },
  freezeProperties: (obj, list = []) => {
    const frozenProp = {
      configurable: false,
      writable: false,
    };

    const props = list.reduce((acc, key) => {
      acc[key] = frozenProp;
      return acc;
    }, {});

    Object.defineProperties(obj, props);
  },
  toDegrees: (rad) => {
    return rad * (180 / Math.PI);
  },
  toInterval: (num, interval) => {
    return Math.round(num / interval) * interval;
  },
  toRadians: (deg) => {
    return deg * (Math.PI / 180);
  },

  Array2: (w, h, val = 0) => {
    const cols = new Array(h);
    const rows = new Array(w).fill(val);
    cols.fill(rows);

    return cols;
  },

  DIRECTIONS: Object.freeze({
    "top": 1,
    "right": 2,
    "bottom": 3,
    "left": 4
  })
};


module.exports = util;
