"use strict";


module.exports.DIRECTIONS = Object.freeze({
  "top": 1,
  "right": 2,
  "bottom": 3,
  "left": 4
});


module.exports.Array2 = (w, h, val = 0) => {
  const cols = new Array(h);
  const rows = new Array(w).fill(val);
  cols.fill(rows);

  return cols;
};


module.exports.degToDirection = (deg) => {
  const zzz = {
    270: DIRECTIONS.top,
    0: DIRECTIONS.right,
    90: DIRECTIONS.bottom,
    180: DIRECTIONS.left
  };

  deg %= 360;
  deg = Math.ceil(x / 90) * 90;

  return; ////
};

module.exports.freezeProperties = (obj, list = []) => {
  const frozenProp = {
    configurable: false,
    writable: false,
  };

  const props = list.reduce((acc, key) => {
    acc[key] = frozenProp;
    return acc;
  }, {});

  Object.defineProperties(obj, props);
};
