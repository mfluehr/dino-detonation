"use strict";

const Avatar = require("./avatar"),
      randomName = require("./random-name"),
      sanitizer = require("./sanitizer"),
      util = require("./util");


const User = (socket, lobby) => {
  const joinRoom = (id) => {
    const room = self.lobby.rooms.get(id);

    if (room) {
      try {
        room.addUser(self.id);
      }
      catch (err) {
        console.warn(err);
        self.socket.emit("ioError", err);
      }
    }
    else {
      self.socket.emit("ioError", "The specified room doesn't exist.");
    }
  };

  const listen = () => {
    const userSanitizer = {
      name: (name) => {
        if (!name) {
          throw "The user must have a name.";
        }

        self.lobby.users.forEach((user, id) => {
          if (self.name === name) {
            throw "A user with the specified name already exists.";
          }
        })

        return name;
      }
    };


    self.socket.on("addRoom", (name) => {
      name = sanitizer.toString(name, 20);

      if (!name) {
        name = self.name + "'s room";
      }

      try {
        const room = self.lobby.addRoom(name, self);
        joinRoom(room.id);
      }
      catch (err) {
        console.warn(err);
        self.socket.emit("ioError", err);
      }
    });

    self.socket.on("disconnect", (reason) => {
      if (self.room) {
        self.room.deleteUser(self.id);
      }

      self.lobby.deleteUser(self.id);
    });

    self.socket.on("joinRoom", (id) => {
      id = sanitizer.toString(id);
      joinRoom(id);
    });

    self.socket.on("leaveRoom", () => {
      if (self.room) {
        self.socket.leave(self.room.id);
        self.room.deleteUser(self.id);
      }
      else {
        self.socket.emit("ioError", "The user isn't in a room.");
      }
    });

    self.socket.on("startGame", () => {
      if (self.room) {
        if (self.room.ownerId === self.id) {
          self.room.startGame();
        }
        else {
          self.socket.emit("ioError", "The user doesn't own the room.");
        }
      }
      else {
        self.socket.emit("ioError", "The user isn't in a room.");
      }
    });

    self.socket.on("updateUser", (data) => {
      util.updateObject(self, userSanitizer, data);
    });
  };


  const self = (() => {
    const properties = Object.seal({
      id: "u" + socket.conn.id,
      avatar: undefined,
      email: "noreply@example.com",
      lobby,
      //// readyToStart: false,
      socket,
      name: randomName(),
      room: undefined,

      get lobbyData () {
        return {
          id: p.id,
          props: {
            id: p.id,
            name: p.name
          }
        };
      },
      get localData () {
        return {
          id: p.id,
          props: {
            id: p.id,
            name: p.name,
            //// readyToStart: p.readyToStart
          }
        };
      },
      get personalData () {
        return {
          id: p.id,
          props: {
            email: p.email
          }
        };
      }
    });

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (obj[prop] !== val) {
          if (prop === "room") {
            if (val) {
              p.socket.emit("loadLocalRoom", val.localData);
              p.socket.join(val.id);
            }
          }
          else {
            const data = {
              id: p.id,
              props: {
                [prop]: val
              }
            };

            if (prop in p.personalData.props) {
              p.socket.emit("updateLobbyUser", data);
            }
            else {
              if (prop in p.lobbyData.props) {
                p.lobby.clients.emit("updateLobbyUser", data);
              }

              if (p.room && prop in p.localData.props) {
                p.room.clients.emit("updateLocalUser", data);
              }
            }
          }

          obj[prop] = val;
        }

        return true;
      }
    });

    properties.avatar = Avatar(p.socket, p);
    util.freezeProperties(properties, ["id"]);

    return p;
  })();


  listen();


  return self;
};

module.exports = User;
