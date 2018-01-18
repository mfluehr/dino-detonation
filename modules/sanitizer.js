const Validator = require("validator");


const sanitizer = {
  toFloat: (val) => {
    val += "";
    return Validator.toFloat(val);
  },
  toString: (val, len = 100) => {
    val += "";
    val = val.substr(0, len).trim().replace(/  +/g, " ");
    val = Validator.whitelist(val, /\w\'\.\-_ /);
    return val;
  },
  Validator
};

module.exports = sanitizer;
