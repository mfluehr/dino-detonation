"use strict";


const Lobby = () => {
  const addRooms = (rooms) => {
    rooms.forEach((room) => {
      if (self.rooms.has(room.id)) {
        Object.assign(self.rooms.get(room.id), room.props);
      }
      else {
        const newRoom = Room(room.props, self);
        self.rooms.set(newRoom.id, newRoom);
      }
    });
  };

  const addUsers = (users) => {
    users.forEach((user) => {
      if (self.users.has(user.id)) {
        Object.assign(self.users.get(user.id), user.props);
      }
      else {
        const newUser = User(user.props, self);
        self.users.set(newUser.id, newUser);
      }
    });
  };

  const createRoom = () => {
    const roomName = self.els.roomName.value;
    self.socket.emit("addRoom", roomName);
  };

  const joinRoom = (id) => {
    self.socket.emit("joinRoom", id);
  };

  const listenToServer = () => {
    self.socket.on("addLobbyRoom", (...data) => addRooms(data));
    self.socket.on("addLobbyUser", (...data) => addUsers(data));
    self.socket.on("deleteLobbyRoom", (id) => self.rooms.delete(id));
    self.socket.on("deleteLobbyUser", (id) => self.users.delete(id));
    self.socket.on("disconnect", (reason) => unload());
    self.socket.on("ioError", (err) => console.warn(err));
    self.socket.on("loadPersonalUser", (data) => loadPersonalUser(data));
    self.socket.on("loadLobby", (data) => load(data));
    self.socket.on("updateLobbyRoom", (data) => updateRoom(data));
    self.socket.on("updateLobbyUser", (data) => updateUser(data));
  };

  const listenToUser = () => {
    self.els.createRoom.addEventListener("click", (e) => createRoom());
    self.els.login.addEventListener("click", (e) => login());

    self.els.roomList.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        joinRoom(e.target.dataset.id);
      }
    });
  };

  const load = (data) => {
    if (data.rooms.length) {
      addRooms(data.rooms);
    }

    if (data.users.length) {
      addUsers(data.users);
    }

    listenToUser();
  };

  const loadPersonalUser = (id) => {
    const el = self.els.userList.querySelector(`[data-id="${id}"]`);
    el.classList.add("personal");

    lobby.personalUser.load(self.users.get(id));
    app.view = "lobby";
  };

  const login = () => {
    self.personalUser.name = self.els.userName.value;
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

  const unshowRoomUpdate = (id) => {
    const li = self.els.roomList.querySelector(`[data-id="${id}"]`);
    li.remove();
  };

  const unshowUserUpdate = (id) => {
    const li = self.els.userList.querySelector(`[data-id="${id}"]`);
    li.remove();
  };

  const unload = () => {
    self.rooms.clear();
    self.users.clear();
    self.personalUser.room.unload();
    console.log("Lobby connection lost!");
  };

  const updateRoom = (room) => {
    Object.assign(self.rooms.get(room.id), room.props);
  };

  const updateUser = (user) => {
    Object.assign(self.users.get(user.id), user.props);
  };


  const self = (() => {
    const properties = Object.seal({
      els: {
        createRoom: document.getElementById("create-room"),
        login: document.getElementById("login"),
        roomList: document.getElementById("lobby-view-rooms"),
        roomName: document.getElementById("room-name"),
        userList: document.getElementById("lobby-view-users"),
        userName: document.getElementById("user-name")
      },
      personalUser: {},
      socket: io.connect(app.url),
      rooms: new Map(),
      users: new Map(),

      get showRoomUpdate () { return showRoomUpdate; },
      get showUserUpdate () { return showUserUpdate; }
    });

    const p = properties;

    p.personalUser = PersonalUser(p);

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
