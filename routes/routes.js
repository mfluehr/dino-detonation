const express = require("express");
const router = express.Router();

let lobby;


const setLobby = (data) => {
  lobby = data;
};


router.get("/", (req, res, next) => {
  return res.render("lobby", {
    rooms: lobby.rooms
  });
});

module.exports = router;
module.exports.setLobby = setLobby;
