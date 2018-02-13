"use strict";

const sanitizer = require("./sanitizer");


const util = {
  degToDirection: (deg) => {
    ////
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
  syncObject: (obj, objectSanitizer, { prop, val }) => {
    prop = sanitizer.toString(prop);
    val = sanitizer.toString(val);

    if (Object.getOwnPropertyDescriptor(obj, prop)) {
      const san = objectSanitizer[prop];

      if (san) {
        try {
          val = san(val, 20);
          obj[prop] = val;
        }
        catch (err) {
          console.warn(err);
          obj.socket.emit("ioError", err);
        }
      }
      else {
        obj.socket.emit("ioError", `"${prop}" failed to validate.`);
      }
    }
    else {
      obj.socket.emit("ioError", `"${prop}" is not editable.`);
    }
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
    //// TODO: new Array is inefficient because it has holes
    const cols = new Array(h);
    const rows = new Array(w).fill(val);
    cols.fill(rows);

    return cols;
  },

  DIRECTIONS: Object.freeze({
    ////
    "top": 1,
    "right": 2,
    "bottom": 3,
    "left": 4
  })
};


module.exports = util;
