const fs = require("fs");


let firstNames = ["John"],
    lastNames = ["Doe"];

fs.readFile("data/first-names.txt", (err, data) => {
  firstNames = data.toString().trim().split("\n");
});

fs.readFile("data/last-names.txt", (err, data) => {
  lastNames = data.toString().trim().split("\n");
});


const randomName = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        last = lastNames[Math.floor(Math.random() * lastNames.length)];

  return first + " " + last;
};

module.exports = randomName;
