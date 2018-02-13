"use strict";

// Environment settings
require("dotenv").config();

// App setup
const express = require("express");


const app = express();
const server = app.listen(process.env.PORT || 4000, () => {
  console.log("Server listening for requests.");
});

// View templating
app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);

// Request router
const routes = require("./routes/routes");
app.use("/", routes);

// Folder for public files
app.use(express.static("public"));

// Game lobby
const lobby = require("./modules/lobby")(server);
routes.setLobby(lobby);
