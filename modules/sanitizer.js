const Validator = require("validator");


const sanitizer = {
  toBoolean: (val) => {
    val += "";
    return Validator.toBoolean(val);
  },
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
