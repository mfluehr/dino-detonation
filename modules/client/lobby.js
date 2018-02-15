"use strict";

const Room = require("./room"),
      User = require("./user"),
      LocalRoom = require("./local-room");

const Lobby = (app) => {
  const listenToServer = () => {
    app.socket.on("disconnect", unload);
    app.socket.on("ioError", (err) => console.warn(err));
    app.socket.on("loadLobby", load);
    app.socket.on("loadLobbyRoom", loadRoom);
    app.socket.on("loadLobbyUser", loadUser);
    app.socket.on("loadLocalRoom", loadLocalRoom);
    app.socket.on("loadPersonalUser", loadPersonalUser);
    app.socket.on("syncLobbyRoom", syncRoom);
    app.socket.on("syncLobbyUser", syncUser);
    app.socket.on("unloadLobbyRoom", unloadRoom);
    app.socket.on("unloadLobbyUser", unloadUser);
  };

  const listenToUser = () => {
    self.els.createRoom.addEventListener("click", actions.createRoom);
    self.els.login.addEventListener("click", actions.login);
    self.els.roomList.addEventListener("click", actions.joinRoom);
  };

  const load = (data) => {
    self.els = {
      createRoom: document.getElementById("create-room"),
      login: document.getElementById("login"),
      roomList: document.getElementById("lobby-view-rooms"),
      roomName: document.getElementById("room-name"),
      userList: document.getElementById("lobby-view-users"),
      userName: document.getElementById("user-name")
    };

    data.rooms.forEach((room) => loadRoom(room));
    data.users.forEach((user) => loadUser(user));
    listenToUser();
  };

  const loadLocalRoom = (data) => {
    app.user.room = LocalRoom(app, self, data);
  };

  const loadPersonalUser = (id) => {
    const el = self.els.userList.querySelector(`[data-id="${id}"]`);
    el.classList.add("personal");

    app.user.load(id);
    app.view = "lobby";
  };

  const loadRoom = (data) => {
    const newRoom = Room(data.props, self);
    self.rooms.set(newRoom.id, newRoom);
  };

  const loadUser = (data) => {
    const newUser = User(data.props, self);
    self.users.set(newUser.id, newUser);
  };

  const showRoom = ({ id, name, numUsers, maxUsers }) => {
    self.els.roomList.insertAdjacentHTML("beforeend",
        `<tr data-id="${id}">` +
          `<td><a class="name" href="#" data-id="${id}">${name}</a></td>` +
          `<td>` +
            `<span class="numUsers">${numUsers}</span> / ` +
            `<span class="maxUsers">${maxUsers}</span>` +
          `</td>` +
        `</tr>`);
  };

  const showUser = ({ id, name }) => {
    self.els.userList.insertAdjacentHTML("beforeend",
        `<li data-id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const showRoomUpdate = (room, prop) => {
    const shownInLobby = new Set(["name", "maxUsers", "numUsers"]);

    if (shownInLobby.has(prop)) {
      const el = self.els.roomList.querySelector(`[data-id="${room.id}"] .${prop}`);
      el.innerText = room[prop];
    }
  };

  const showUserUpdate = (user, prop) => {
    const shownInLobby = new Set(["name"]);

    if (shownInLobby.has(prop)) {
      const el = self.els.userList.querySelector(`[data-id="${user.id}"] .${prop}`);
      el.innerText = user[prop];
    }
  };

  const syncRoom = (data) => {
    Object.assign(self.rooms.get(data.id), data.props);
  };

  const syncUser = (data) => {
    Object.assign(self.users.get(data.id), data.props);
  };

  const unlistenToUser = () => {
    self.els.createRoom.removeEventListener("click", actions.createRoom);
    self.els.login.removeEventListener("click", actions.login);
    self.els.roomList.removeEventListener("click", actions.joinRoom);
  };

  const unload = () => {
    unlistenToUser();
    unloadRooms();
    unloadUsers();
    console.log("Lobby connection lost!");
  };

  const unloadRoom = (id) => {
    self.rooms.delete(id);
  };

  const unloadRooms = () => {
    self.rooms.clear();

    if (app.user.room) {
      app.user.room.unload();
    }
  };

  const unloadUser = (id) => {
    self.users.delete(id);
  };

  const unloadUsers = () => {
    self.users.clear();
  };

  const unshowRoomUpdate = (id) => {
    const li = self.els.roomList.querySelector(`[data-id="${id}"]`);
    li.remove();
  };

  const unshowUserUpdate = (id) => {
    const li = self.els.userList.querySelector(`[data-id="${id}"]`);
    li.remove();
  };


  const actions = {
    createRoom: () => {
      const roomName = self.els.roomName.value;
      app.socket.emit("loadRoom", roomName);
    },
    joinRoom: (e) => {
      if (e.target.tagName === "A") {
        app.user.joinRoom(e.target.dataset.id);
      }
    },
    login: () => {
      app.user.name = self.els.userName.value;
    }
  };


  const self = (() => {
    const properties = Object.seal({
      els: undefined,
      rooms: new Map(),
      users: new Map(),

      get showRoomUpdate () { return showRoomUpdate; },
      get showUserUpdate () { return showUserUpdate; }
    });

    const p = properties;

    p.rooms.set = function (id, room) {
      showRoom(room);
      return Map.prototype.set.apply(this, arguments);
    };

    p.rooms.clear = function () {
      while (p.els.roomList.firstChild) {
        p.els.roomList.removeChild(p.els.roomList.firstChild);
      }
      return Map.prototype.clear.apply(this, arguments);
    };

    p.rooms.delete = function (id) {
      unshowRoomUpdate(id);
      return Map.prototype.delete.apply(this, arguments);
    };

    p.users.set = function (id, user) {
      showUser(user);
      return Map.prototype.set.apply(this, arguments);
    };

    p.users.clear = function () {
      while (p.els.userList.firstChild) {
        p.els.userList.removeChild(p.els.userList.firstChild);
      }
      return Map.prototype.clear.apply(this, arguments);
    };

    p.users.delete = function (id) {
      unshowUserUpdate(id);
      return Map.prototype.delete.apply(this, arguments);
    };

    return p;
  })();


  listenToServer();


  return self;
};


module.exports = Lobby;
