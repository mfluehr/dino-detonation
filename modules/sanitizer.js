const Validator = require("validator");


const sanitizer = {
  toString: (val, len = 100) => {
    val += "";
    val = val.substr(0, len).trim().replace(/  +/g, " ");
    val = Validator.whitelist(val, /\w\'\.\-_ /);
    return val;
  },
  Validator
};

module.exports = sanitizer;
