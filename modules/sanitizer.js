const Validator = require("validator");


const Sanitizer = {
  toString: (val, len = 20) => {
    val += "";
    val = val.substr(0, len).trim().replace(/  +/g, " ");
    val = Validator.whitelist(val, /\w\.\-_ /);
    return val;
  }
};

module.exports = Sanitizer;
