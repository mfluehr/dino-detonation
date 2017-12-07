modules.exports.DIRECTIONS = Object.freeze({
  "top": 1,
  "right": 2,
  "bottom": 3,
  "left": 4
});


modules.exports.Array2 = (w, h, val = 0) {
  const cols = new Array(h);
  const rows = new Array(w).fill(val);
  cols.fill(rows);

  return cols;
};
