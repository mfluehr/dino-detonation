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
