/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const App = __webpack_require__(1);


const app = App();
app.load();


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Lobby = __webpack_require__(2),
      PersonalUser = __webpack_require__(11);


const App = () => {
  const load = () => {
    self.els = {
      views: document.getElementsByClassName("view"),
      lobby: document.getElementById("lobby-view"),
      room: document.getElementById("room-view"),
      game: document.getElementById("game-view")
    };

    self.socket = io.connect(self.url);
    self.lobby = Lobby(self);
    self.user = PersonalUser(self, self.lobby);
  };


  const self = (() => {
    const properties = Object.seal({
      lobby: undefined,
      els: undefined,
      socket: undefined,
      url: "localhost:4000",
      user: undefined,
      view: undefined,

      get load () { return load; }
    });

    const p = new Proxy(properties, {
      get: (obj, prop) => {
        return obj[prop];
      },
      set: (obj, prop, val) => {
        obj[prop] = val;

        // if (prop === "view") {
        //   for (let i = 0; i < p.els.views.length; i ++) {
        //     p.els.views[i].classList.add("hidden");
        //   }
        //   p.els[val].classList.remove("hidden");
        // }

        return true;
      }
    });

    return p;
  })();


  return self;
};


module.exports = App;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Room = __webpack_require__(3),
      User = __webpack_require__(4),
      LocalRoom = __webpack_require__(5);

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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



const Room = (properties, lobby) => {
  const self = new Proxy(properties, {
    set: (obj, prop, val) => {
      obj[prop] = val;
      lobby.showRoomUpdate(self, prop);
      return true;
    }
  });

  return self;
};


module.exports = Room;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



const User = (properties = {}, lobby) => {
  const self = new Proxy(properties, {
    set: (obj, prop, val) => {
      obj[prop] = val;
      lobby.showUserUpdate(self, prop);
      return true;
    }
  });

  return self;
};


module.exports = User;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const LocalLevel = __webpack_require__(6),
      LocalUser = __webpack_require__(9);


const LocalRoom = (app, lobby, data) => {
  const listenToServer = () => {
    app.socket.on("loadLocalLevel", loadLocalLevel);
    app.socket.on("loadLocalUser", loadUser);
    app.socket.on("syncAvatar", syncAvatar);
    app.socket.on("syncLocalRoom", syncRoom);
    app.socket.on("syncLocalUser", syncUser);
    app.socket.on("unloadLocalUser", unloadUser);
  };

  const listenToUser = () => {
    self.els.leaveRoom.addEventListener("click", unload);
    self.els.startGame.addEventListener("click", app.user.startGame);
  };

  const load = (data) => {
    self.els = {
      leaveRoom: document.getElementById("room-view-leave"),
      startGame: document.getElementById("room-view-start"),
      userList: document.getElementById("room-view-users")
    };

    app.user.room = self;
    data.users.forEach((user) => loadUser(user));
    Object.assign(self, data.props);

    const el = self.els.userList.querySelector(`[data-id="${app.user.id}"]`);
    el.classList.add("personal");

    listenToServer();
    listenToUser();
    app.view = "room";
  };

  const loadLocalLevel = (data) => {
    self.level = LocalLevel(app, self, data);
  };

  const loadUser = (data) => {
    const localUser = LocalUser(app, lobby.users.get(data.id), self);
    self.users.set(localUser.id, localUser);
    Object.assign(localUser, data.props);
    Object.assign(localUser.avatar, data.avatar.props);
  };

  const showUser = ({ id, name }) => {
    self.els.userList.insertAdjacentHTML("beforeend",
        `<li data-id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const showUserUpdate = (user, prop) => {
    const shownInRoom = new Set(["name"]);

    if (shownInRoom.has(prop)) {
      const el = self.els.userList.querySelector(`[data-id="${user.id}"] .${prop}`);
      el.innerText = user[prop];
    }
  };

  const syncAvatar = (data) => {
    self.users.get(data.id).avatar.sync(data);
  };

  const syncRoom = (data) => {
    Object.assign(self, data.props);
  };

  const syncUser = (data) => {
    Object.assign(self.users.get(data.id), data.props);
  };

  const unlistenToServer = () => {
    app.socket.off("loadLocalLevel", loadLocalLevel);
    app.socket.off("loadLocalUser", loadUser);
    app.socket.off("syncAvatar", syncAvatar);
    app.socket.off("syncLocalRoom", syncRoom);
    app.socket.off("syncLocalUser", syncUser);
    app.socket.off("unloadLocalUser", unloadUser);
  };

  const unlistenToUser = () => {
    self.els.leaveRoom.removeEventListener("click", unload);
    self.els.startGame.removeEventListener("click", app.user.startGame);
  };

  const unshowUser = (id) => {
    const li = self.els.userList.querySelector(`[data-id=${id}]`);
    li.remove();
  };

  const unload = () => {
    app.socket.emit("leaveRoom");
    unlistenToServer();
    unlistenToUser();
    unloadLevel();
    unloadUsers();
    app.view = "lobby";
  };

  const unloadLevel = () => {
    if (self.level) {
      self.level.unload();
    }
  };

  const unloadUser = (id) => {
    self.users.delete(id);
  };

  const unloadUsers = () => {
    self.users.clear();
  };


  const self = (() => {
    const properties = {
      els: undefined,
      users: new Map(),

      get showUserUpdate () { return showUserUpdate; },
      get unload () { return unload; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;

        if (prop === "ownerId") {
          const el = p.els.userList.querySelector(`[data-id="${val}"]`);
          el.classList.add("owner");

          if (val === app.user.id) {
            p.els.startGame.classList.remove("hidden");
          }
          else {
            p.els.startGame.classList.add("hidden");
          }
        }

        return true;
      }
    });

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
      unshowUser(id);
      return Map.prototype.delete.apply(this, arguments);
    };

    return p;
  })();


  load(data);


  return self;
};


module.exports = LocalRoom;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Tile = __webpack_require__(7);


const LocalLevel = (app, room, data) => {
  const initCanvas = () => {
    const initText = () => {
      const style = new PIXI.TextStyle({
        fill: "yellow",
        fontSize: 16
      });

      msg = new PIXI.Text("...", style);
      msg.position.set(5, 5);
      gfx.stage.addChild(msg);
    };

    const initTileTextures = () => {
      const texture = PIXI.loader.resources["images/tiles.png"].texture;
      const rect = new PIXI.Rectangle(192, 128, 64, 64);

      texture.frame = rect;
    };

    const initTextures = () => {
      // initTileTextures();


      // initTileSprites();
      initAvatarSprites();
      gfx.ticker.add(delta => gameLoop(delta));
    };


    const imageFiles = [
            { name: "avatar", url: "images/avatar.png" },
            { name: "tiles", url: "images/tiles.png" }
          ],
          pixiOptions = {
            width: 600,
            height: 600
          };

    gfx = new PIXI.Application(pixiOptions);
    gfx.renderer.backgroundColor = 0x5555BB;

    initText();

    PIXI.loader.add(imageFiles)
        //// .on("progress", spriteProgress)
        .load(initTextures);
    app.els.game.appendChild(gfx.view);
  };

  const draw = () => {
    const z = self.room.users.get(app.user.id).avatar;

    msg.text = `${Math.round(z.x)},${Math.round(z.y)} @ ${z.speed}`;

    room.users.forEach((user) => {
      const avatar = user.avatar;
      self.sprites.get(user.id).position.set(avatar.x, avatar.y);
    });
  };

  const gameLoop = (delta) => {
    interpolate(delta);
    draw();
  };

  const initAvatarSprites = () => {
    room.users.forEach((user) => {
      const texture = PIXI.loader.resources.avatar.texture;
      const sprite = new PIXI.Sprite(texture);
      self.sprites.set(user.id, sprite);
      gfx.stage.addChild(self.sprites.get(user.id));
    });
  };

  const initTileSprites = () => {
    self.tiles.forEach((row) => {
      row.forEach((tile) => {
        ////tile.type
        const texture = PIXI.loader.resources["tile" + tile.type].texture;
        const sprite = new PIXI.Sprite(texture);
        gfx.stage.addChild(sprite);
      });
    });
  };

  const interpolate = (delta) => {
    const ms = delta / 60 * 1000;

    room.users.forEach((user) => {
      user.avatar.tick(ms);
    });
  };







  const listenToServer = () => {
    ////
  };

  const listenToUser = () => {
    document.addEventListener("keydown", app.user.avatar.startAction);
    document.addEventListener("keyup", app.user.avatar.endAction);
  };

  const load = (data) => {
    Object.assign(self, data.props);
    listenToServer();
    listenToUser();

    ////
    // tiles
    self.tiles = data.tiles.map((row) => {
      return row.map((tile) => Tile(tile));
    });

    initCanvas();
    app.user.avatar.load();
    app.view = "game";
  };

  const unlistenToServer = () => {
    ////
  };

  const unlistenToUser = () => {
    document.removeEventListener("keydown", app.user.avatar.startAction);
    document.removeEventListener("keyup", app.user.avatar.endAction);
  };

  const unload = () => {
    gfx.ticker.destroy();
    unlistenToServer();
    unlistenToUser();
    app.view = "room";
  };


  let gfx,
      msg;


  const self = (() => {
    const editable = new Set(["paused"]);

    const properties = {
      room,
      sprites: new Map(),
      tiles: [],

      get unload () { return unload; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (editable.has(prop)) {
          app.socket.emit("syncLevel", { prop, val });
          return true;
        }

        obj[prop] = val;
        return true;
      }
    });

    return p;
  })();


  load(data);


  return self;
};


module.exports = LocalLevel;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const tileTypes = __webpack_require__(8);


const Tile = (data) => {
  const self = data;

  return self;
};


module.exports = Tile;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



const TileType = ({
  name = "unknown",
  defusesBombs = false,
  explodes = false,
  fatal = false,
  friction = 1,
  respawns = false,
  solid = false,
  triggersBombs = false,
  hp = Infinity,
  pickupOdds = 0,
  wear = Infinity
} = {}) => {
  const self = (() => {
    const properties = Object.freeze({
      name,
      defusesBombs,
      explodes,
      fatal,
      friction,
      respawns,
      solid,
      triggersBombs,
      stats: {
        hp,
        pickupOdds,
        wear
      }
    });

    const p = properties;

    return p;
  })();

  return self;
};


const tileTypes = {
  0: TileType({
    name: "grass"
  }),
  1: TileType({
    name: "rock",
    hp: 1,
    solid: true
  }),
  2: TileType({
    name: "fire",
    fatal: true,
    triggersBombs: true
  }),
  3: TileType({
    name: "marsh",
    defusesBombs: true
  }),
  4: TileType({
    name: "mirror",
    solid: true
  }),
  5: TileType({
    name: "oil",
    friction: 0
  }),
  6: TileType({
    name: "pit",
    defusesBombs: true,
    fatal: true
  }),
  7: TileType({
    name: "steel",
    solid: true
  }),
  8: TileType({
    name: "TNT",
    explodes: true,
    hp: 1,
    solid: true
  }),
  9: TileType({
    name: "fan",
    solid: true
  })
};


module.exports = tileTypes;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const LocalAvatar = __webpack_require__(10);


const LocalUser = (app, base, room) => {
  const self = (() => {
    const properties = Object.assign({}, base);

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        room.showUserUpdate(p, prop);
        return true;
      }
    });

    properties.avatar = LocalAvatar(app, p);

    return p;
  })();

  return self;
};


module.exports = LocalUser;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



const LocalAvatar = (app, user) => {
  const sync = (data) => {
    Object.assign(self, data.props);
  };

  const tick = (ms) => {
    self.x += Math.cos(self.rad) * self.speed * ms;
    self.y += Math.sin(self.rad) * self.speed * ms;
  };


  const self = (() => {
    const properties = {
      socket: app.socket,
      user,

      get sync () { return sync; },
      get tick () { return tick; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        return true;
      }
    });

    return p;
  })();


  return self;
};


module.exports = LocalAvatar;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const PersonalAvatar = __webpack_require__(12);


const PersonalUser = (app, lobby) => {
  const joinRoom = (id) => {
    app.socket.emit("joinRoom", id);
  };

  const load = (id) => {
    self.id = id;
  };

  const startGame = () => {
    app.socket.emit("startGame");
  };


  const self = (() => {
    const editable = new Set(["email", "name"]);

    const properties = {
      get createRoom () { return createRoom; },
      get joinRoom () { return joinRoom; },
      get load () { return load; },
      get login () { return login; },
      get startGame () { return startGame; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (editable.has(prop)) {
          app.socket.emit("syncUser", { prop, val });
          return true;
        }

        obj[prop] = val;
        return true;
      }
    });

    properties.avatar = PersonalAvatar(app, p);

    return p;
  })();


  return self;
};


module.exports = PersonalUser;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



const PersonalAvatar = (app, user) => {
  const endAction = (e) => {
    const a = self.input.get(e.key);

    if (a && self.actions.has(a)) {
      self.actions.delete(a);

      switch (a) {
        case "moveUp":
        case "moveRight":
        case "moveDown":
        case "moveLeft":
          if (!self.actions.has("moveUp") &&
              !self.actions.has("moveRight") &&
              !self.actions.has("moveDown") &&
              !self.actions.has("moveLeft")) {
            self.speed = 0;
          }
          break;
      }
    }
  };

  const load = () => {
    self.local = user.room.users.get(user.id).avatar;
  };

  const startAction = (e) => {
    const a = self.input.get(e.key);

    if (a && !self.actions.has(a)) {
      self.actions.add(a);

      switch (a) {
        case "dropBomb":
          app.socket.emit(a);
          break;
        case "moveUp":
          self.rad = Math.PI * 3/2;
          self.speed = self.local.speedLimit;
          break;
        case "moveRight":
          self.rad = 0;
          self.speed = self.local.speedLimit;
          break;
        case "moveDown":
          self.rad = Math.PI * 1/2;
          self.speed = self.local.speedLimit;
          break;
        case "moveLeft":
          self.rad = Math.PI;
          self.speed = self.local.speedLimit;
          break;
        case "pauseGame":
          self.level.paused = !self.level.paused;
          break;
      }
    }
  };


  const self = (() => {
    const editable = new Set(["rad", "speed"]);

    const properties = {
      actions: new Set(),
      input: new Map([
        [" ", "dropBomb"],
        ["ArrowUp", "moveUp"],
        ["ArrowRight", "moveRight"],
        ["ArrowDown", "moveDown"],
        ["ArrowLeft", "moveLeft"],
        ["p", "pauseGame"]
      ]),
      user,

      get endAction () { return endAction; },
      get load () { return load; },
      get startAction () { return startAction; },

      get level () { return self.user.room.level; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (editable.has(prop)) {
          app.socket.emit("syncAvatar", { prop, val });
          self.local[prop] = val;
          return true;
        }

        obj[prop] = val;
        return true;
      }
    });

    return p;
  })();


  return self;
};


module.exports = PersonalAvatar;


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMjA4OTMwNTdjNDlmYjgzZmVkOWIiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jbGllbnQvYnVuZGxlLmpzIiwid2VicGFjazovLy8uL21vZHVsZXMvY2xpZW50L2FwcC5qcyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2NsaWVudC9sb2JieS5qcyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2NsaWVudC9yb29tLmpzIiwid2VicGFjazovLy8uL21vZHVsZXMvY2xpZW50L3VzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jbGllbnQvbG9jYWwtcm9vbS5qcyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2NsaWVudC9sb2NhbC1sZXZlbC5qcyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2NsaWVudC90aWxlLmpzIiwid2VicGFjazovLy8uL21vZHVsZXMvY29tbW9uL3RpbGUtdHlwZXMuanMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jbGllbnQvbG9jYWwtdXNlci5qcyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2NsaWVudC9sb2NhbC1hdmF0YXIuanMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jbGllbnQvcGVyc29uYWwtdXNlci5qcyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2NsaWVudC9wZXJzb25hbC1hdmF0YXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFD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dUJBQXVCLGlCQUFpQixFQUFFO0FBQzFDLG1CQUFtQixhQUFhLEVBQUU7QUFDbEMsb0JBQW9CLGNBQWMsRUFBRTtBQUNwQyx3QkFBd0Isa0JBQWtCO0FBQzFDOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxZQUFZO0FBQ25EO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBLEdBQUc7OztBQUdIO0FBQ0E7OztBQUdBOzs7Ozs7OztBQ3BEQTs7O0FBR0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHdCQUF3QixrQkFBa0IsRUFBRTtBQUM1QyxtQkFBbUIsYUFBYSxFQUFFO0FBQ2xDLDBCQUEwQixvQkFBb0IsRUFBRTs7QUFFaEQsb0JBQW9CLDZCQUE2QjtBQUNqRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsWUFBWTtBQUNyRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBLEdBQUc7OztBQUdIO0FBQ0E7OztBQUdBIiwiZmlsZSI6ImRpbm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAyMDg5MzA1N2M0OWZiODNmZWQ5YiIsIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBBcHAgPSByZXF1aXJlKFwiLi9hcHBcIik7XG5cblxuY29uc3QgYXBwID0gQXBwKCk7XG5hcHAubG9hZCgpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9tb2R1bGVzL2NsaWVudC9idW5kbGUuanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IExvYmJ5ID0gcmVxdWlyZShcIi4vbG9iYnlcIiksXG4gICAgICBQZXJzb25hbFVzZXIgPSByZXF1aXJlKFwiLi9wZXJzb25hbC11c2VyXCIpO1xuXG5cbmNvbnN0IEFwcCA9ICgpID0+IHtcbiAgY29uc3QgbG9hZCA9ICgpID0+IHtcbiAgICBzZWxmLmVscyA9IHtcbiAgICAgIHZpZXdzOiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidmlld1wiKSxcbiAgICAgIGxvYmJ5OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYmJ5LXZpZXdcIiksXG4gICAgICByb29tOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb20tdmlld1wiKSxcbiAgICAgIGdhbWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS12aWV3XCIpXG4gICAgfTtcblxuICAgIHNlbGYuc29ja2V0ID0gaW8uY29ubmVjdChzZWxmLnVybCk7XG4gICAgc2VsZi5sb2JieSA9IExvYmJ5KHNlbGYpO1xuICAgIHNlbGYudXNlciA9IFBlcnNvbmFsVXNlcihzZWxmLCBzZWxmLmxvYmJ5KTtcbiAgfTtcblxuXG4gIGNvbnN0IHNlbGYgPSAoKCkgPT4ge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3Quc2VhbCh7XG4gICAgICBsb2JieTogdW5kZWZpbmVkLFxuICAgICAgZWxzOiB1bmRlZmluZWQsXG4gICAgICBzb2NrZXQ6IHVuZGVmaW5lZCxcbiAgICAgIHVybDogXCJsb2NhbGhvc3Q6NDAwMFwiLFxuICAgICAgdXNlcjogdW5kZWZpbmVkLFxuICAgICAgdmlldzogdW5kZWZpbmVkLFxuXG4gICAgICBnZXQgbG9hZCAoKSB7IHJldHVybiBsb2FkOyB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBwID0gbmV3IFByb3h5KHByb3BlcnRpZXMsIHtcbiAgICAgIGdldDogKG9iaiwgcHJvcCkgPT4ge1xuICAgICAgICByZXR1cm4gb2JqW3Byb3BdO1xuICAgICAgfSxcbiAgICAgIHNldDogKG9iaiwgcHJvcCwgdmFsKSA9PiB7XG4gICAgICAgIG9ialtwcm9wXSA9IHZhbDtcblxuICAgICAgICAvLyBpZiAocHJvcCA9PT0gXCJ2aWV3XCIpIHtcbiAgICAgICAgLy8gICBmb3IgKGxldCBpID0gMDsgaSA8IHAuZWxzLnZpZXdzLmxlbmd0aDsgaSArKykge1xuICAgICAgICAvLyAgICAgcC5lbHMudmlld3NbaV0uY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vICAgcC5lbHNbdmFsXS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcDtcbiAgfSkoKTtcblxuXG4gIHJldHVybiBzZWxmO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbW9kdWxlcy9jbGllbnQvYXBwLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBSb29tID0gcmVxdWlyZShcIi4vcm9vbVwiKSxcbiAgICAgIFVzZXIgPSByZXF1aXJlKFwiLi91c2VyXCIpLFxuICAgICAgTG9jYWxSb29tID0gcmVxdWlyZShcIi4vbG9jYWwtcm9vbVwiKTtcblxuY29uc3QgTG9iYnkgPSAoYXBwKSA9PiB7XG4gIGNvbnN0IGxpc3RlblRvU2VydmVyID0gKCkgPT4ge1xuICAgIGFwcC5zb2NrZXQub24oXCJkaXNjb25uZWN0XCIsIHVubG9hZCk7XG4gICAgYXBwLnNvY2tldC5vbihcImlvRXJyb3JcIiwgKGVycikgPT4gY29uc29sZS53YXJuKGVycikpO1xuICAgIGFwcC5zb2NrZXQub24oXCJsb2FkTG9iYnlcIiwgbG9hZCk7XG4gICAgYXBwLnNvY2tldC5vbihcImxvYWRMb2JieVJvb21cIiwgbG9hZFJvb20pO1xuICAgIGFwcC5zb2NrZXQub24oXCJsb2FkTG9iYnlVc2VyXCIsIGxvYWRVc2VyKTtcbiAgICBhcHAuc29ja2V0Lm9uKFwibG9hZExvY2FsUm9vbVwiLCBsb2FkTG9jYWxSb29tKTtcbiAgICBhcHAuc29ja2V0Lm9uKFwibG9hZFBlcnNvbmFsVXNlclwiLCBsb2FkUGVyc29uYWxVc2VyKTtcbiAgICBhcHAuc29ja2V0Lm9uKFwic3luY0xvYmJ5Um9vbVwiLCBzeW5jUm9vbSk7XG4gICAgYXBwLnNvY2tldC5vbihcInN5bmNMb2JieVVzZXJcIiwgc3luY1VzZXIpO1xuICAgIGFwcC5zb2NrZXQub24oXCJ1bmxvYWRMb2JieVJvb21cIiwgdW5sb2FkUm9vbSk7XG4gICAgYXBwLnNvY2tldC5vbihcInVubG9hZExvYmJ5VXNlclwiLCB1bmxvYWRVc2VyKTtcbiAgfTtcblxuICBjb25zdCBsaXN0ZW5Ub1VzZXIgPSAoKSA9PiB7XG4gICAgc2VsZi5lbHMuY3JlYXRlUm9vbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYWN0aW9ucy5jcmVhdGVSb29tKTtcbiAgICBzZWxmLmVscy5sb2dpbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYWN0aW9ucy5sb2dpbik7XG4gICAgc2VsZi5lbHMucm9vbUxpc3QuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFjdGlvbnMuam9pblJvb20pO1xuICB9O1xuXG4gIGNvbnN0IGxvYWQgPSAoZGF0YSkgPT4ge1xuICAgIHNlbGYuZWxzID0ge1xuICAgICAgY3JlYXRlUm9vbTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcmVhdGUtcm9vbVwiKSxcbiAgICAgIGxvZ2luOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ2luXCIpLFxuICAgICAgcm9vbUxpc3Q6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9iYnktdmlldy1yb29tc1wiKSxcbiAgICAgIHJvb21OYW1lOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb20tbmFtZVwiKSxcbiAgICAgIHVzZXJMaXN0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYmJ5LXZpZXctdXNlcnNcIiksXG4gICAgICB1c2VyTmFtZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyLW5hbWVcIilcbiAgICB9O1xuXG4gICAgZGF0YS5yb29tcy5mb3JFYWNoKChyb29tKSA9PiBsb2FkUm9vbShyb29tKSk7XG4gICAgZGF0YS51c2Vycy5mb3JFYWNoKCh1c2VyKSA9PiBsb2FkVXNlcih1c2VyKSk7XG4gICAgbGlzdGVuVG9Vc2VyKCk7XG4gIH07XG5cbiAgY29uc3QgbG9hZExvY2FsUm9vbSA9IChkYXRhKSA9PiB7XG4gICAgYXBwLnVzZXIucm9vbSA9IExvY2FsUm9vbShhcHAsIHNlbGYsIGRhdGEpO1xuICB9O1xuXG4gIGNvbnN0IGxvYWRQZXJzb25hbFVzZXIgPSAoaWQpID0+IHtcbiAgICBjb25zdCBlbCA9IHNlbGYuZWxzLnVzZXJMaXN0LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWlkPVwiJHtpZH1cIl1gKTtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKFwicGVyc29uYWxcIik7XG5cbiAgICBhcHAudXNlci5sb2FkKGlkKTtcbiAgICBhcHAudmlldyA9IFwibG9iYnlcIjtcbiAgfTtcblxuICBjb25zdCBsb2FkUm9vbSA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgbmV3Um9vbSA9IFJvb20oZGF0YS5wcm9wcywgc2VsZik7XG4gICAgc2VsZi5yb29tcy5zZXQobmV3Um9vbS5pZCwgbmV3Um9vbSk7XG4gIH07XG5cbiAgY29uc3QgbG9hZFVzZXIgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IG5ld1VzZXIgPSBVc2VyKGRhdGEucHJvcHMsIHNlbGYpO1xuICAgIHNlbGYudXNlcnMuc2V0KG5ld1VzZXIuaWQsIG5ld1VzZXIpO1xuICB9O1xuXG4gIGNvbnN0IHNob3dSb29tID0gKHsgaWQsIG5hbWUsIG51bVVzZXJzLCBtYXhVc2VycyB9KSA9PiB7XG4gICAgc2VsZi5lbHMucm9vbUxpc3QuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsXG4gICAgICAgIGA8dHIgZGF0YS1pZD1cIiR7aWR9XCI+YCArXG4gICAgICAgICAgYDx0ZD48YSBjbGFzcz1cIm5hbWVcIiBocmVmPVwiI1wiIGRhdGEtaWQ9XCIke2lkfVwiPiR7bmFtZX08L2E+PC90ZD5gICtcbiAgICAgICAgICBgPHRkPmAgK1xuICAgICAgICAgICAgYDxzcGFuIGNsYXNzPVwibnVtVXNlcnNcIj4ke251bVVzZXJzfTwvc3Bhbj4gLyBgICtcbiAgICAgICAgICAgIGA8c3BhbiBjbGFzcz1cIm1heFVzZXJzXCI+JHttYXhVc2Vyc308L3NwYW4+YCArXG4gICAgICAgICAgYDwvdGQ+YCArXG4gICAgICAgIGA8L3RyPmApO1xuICB9O1xuXG4gIGNvbnN0IHNob3dVc2VyID0gKHsgaWQsIG5hbWUgfSkgPT4ge1xuICAgIHNlbGYuZWxzLnVzZXJMaXN0Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLFxuICAgICAgICBgPGxpIGRhdGEtaWQ9XCIke2lkfVwiPmAgK1xuICAgICAgICAgIGA8c3BhbiBjbGFzcz1cIm5hbWVcIj4ke25hbWV9PC9zcGFuPmAgK1xuICAgICAgICBgPC9saT5gKTtcbiAgfTtcblxuICBjb25zdCBzaG93Um9vbVVwZGF0ZSA9IChyb29tLCBwcm9wKSA9PiB7XG4gICAgY29uc3Qgc2hvd25JbkxvYmJ5ID0gbmV3IFNldChbXCJuYW1lXCIsIFwibWF4VXNlcnNcIiwgXCJudW1Vc2Vyc1wiXSk7XG5cbiAgICBpZiAoc2hvd25JbkxvYmJ5Lmhhcyhwcm9wKSkge1xuICAgICAgY29uc3QgZWwgPSBzZWxmLmVscy5yb29tTGlzdC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1pZD1cIiR7cm9vbS5pZH1cIl0gLiR7cHJvcH1gKTtcbiAgICAgIGVsLmlubmVyVGV4dCA9IHJvb21bcHJvcF07XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHNob3dVc2VyVXBkYXRlID0gKHVzZXIsIHByb3ApID0+IHtcbiAgICBjb25zdCBzaG93bkluTG9iYnkgPSBuZXcgU2V0KFtcIm5hbWVcIl0pO1xuXG4gICAgaWYgKHNob3duSW5Mb2JieS5oYXMocHJvcCkpIHtcbiAgICAgIGNvbnN0IGVsID0gc2VsZi5lbHMudXNlckxpc3QucXVlcnlTZWxlY3RvcihgW2RhdGEtaWQ9XCIke3VzZXIuaWR9XCJdIC4ke3Byb3B9YCk7XG4gICAgICBlbC5pbm5lclRleHQgPSB1c2VyW3Byb3BdO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBzeW5jUm9vbSA9IChkYXRhKSA9PiB7XG4gICAgT2JqZWN0LmFzc2lnbihzZWxmLnJvb21zLmdldChkYXRhLmlkKSwgZGF0YS5wcm9wcyk7XG4gIH07XG5cbiAgY29uc3Qgc3luY1VzZXIgPSAoZGF0YSkgPT4ge1xuICAgIE9iamVjdC5hc3NpZ24oc2VsZi51c2Vycy5nZXQoZGF0YS5pZCksIGRhdGEucHJvcHMpO1xuICB9O1xuXG4gIGNvbnN0IHVubGlzdGVuVG9Vc2VyID0gKCkgPT4ge1xuICAgIHNlbGYuZWxzLmNyZWF0ZVJvb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFjdGlvbnMuY3JlYXRlUm9vbSk7XG4gICAgc2VsZi5lbHMubG9naW4ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFjdGlvbnMubG9naW4pO1xuICAgIHNlbGYuZWxzLnJvb21MaXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhY3Rpb25zLmpvaW5Sb29tKTtcbiAgfTtcblxuICBjb25zdCB1bmxvYWQgPSAoKSA9PiB7XG4gICAgdW5saXN0ZW5Ub1VzZXIoKTtcbiAgICB1bmxvYWRSb29tcygpO1xuICAgIHVubG9hZFVzZXJzKCk7XG4gICAgY29uc29sZS5sb2coXCJMb2JieSBjb25uZWN0aW9uIGxvc3QhXCIpO1xuICB9O1xuXG4gIGNvbnN0IHVubG9hZFJvb20gPSAoaWQpID0+IHtcbiAgICBzZWxmLnJvb21zLmRlbGV0ZShpZCk7XG4gIH07XG5cbiAgY29uc3QgdW5sb2FkUm9vbXMgPSAoKSA9PiB7XG4gICAgc2VsZi5yb29tcy5jbGVhcigpO1xuXG4gICAgaWYgKGFwcC51c2VyLnJvb20pIHtcbiAgICAgIGFwcC51c2VyLnJvb20udW5sb2FkKCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHVubG9hZFVzZXIgPSAoaWQpID0+IHtcbiAgICBzZWxmLnVzZXJzLmRlbGV0ZShpZCk7XG4gIH07XG5cbiAgY29uc3QgdW5sb2FkVXNlcnMgPSAoKSA9PiB7XG4gICAgc2VsZi51c2Vycy5jbGVhcigpO1xuICB9O1xuXG4gIGNvbnN0IHVuc2hvd1Jvb21VcGRhdGUgPSAoaWQpID0+IHtcbiAgICBjb25zdCBsaSA9IHNlbGYuZWxzLnJvb21MaXN0LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWlkPVwiJHtpZH1cIl1gKTtcbiAgICBsaS5yZW1vdmUoKTtcbiAgfTtcblxuICBjb25zdCB1bnNob3dVc2VyVXBkYXRlID0gKGlkKSA9PiB7XG4gICAgY29uc3QgbGkgPSBzZWxmLmVscy51c2VyTGlzdC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1pZD1cIiR7aWR9XCJdYCk7XG4gICAgbGkucmVtb3ZlKCk7XG4gIH07XG5cblxuICBjb25zdCBhY3Rpb25zID0ge1xuICAgIGNyZWF0ZVJvb206ICgpID0+IHtcbiAgICAgIGNvbnN0IHJvb21OYW1lID0gc2VsZi5lbHMucm9vbU5hbWUudmFsdWU7XG4gICAgICBhcHAuc29ja2V0LmVtaXQoXCJsb2FkUm9vbVwiLCByb29tTmFtZSk7XG4gICAgfSxcbiAgICBqb2luUm9vbTogKGUpID0+IHtcbiAgICAgIGlmIChlLnRhcmdldC50YWdOYW1lID09PSBcIkFcIikge1xuICAgICAgICBhcHAudXNlci5qb2luUm9vbShlLnRhcmdldC5kYXRhc2V0LmlkKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxvZ2luOiAoKSA9PiB7XG4gICAgICBhcHAudXNlci5uYW1lID0gc2VsZi5lbHMudXNlck5hbWUudmFsdWU7XG4gICAgfVxuICB9O1xuXG5cbiAgY29uc3Qgc2VsZiA9ICgoKSA9PiB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5zZWFsKHtcbiAgICAgIGVsczogdW5kZWZpbmVkLFxuICAgICAgcm9vbXM6IG5ldyBNYXAoKSxcbiAgICAgIHVzZXJzOiBuZXcgTWFwKCksXG5cbiAgICAgIGdldCBzaG93Um9vbVVwZGF0ZSAoKSB7IHJldHVybiBzaG93Um9vbVVwZGF0ZTsgfSxcbiAgICAgIGdldCBzaG93VXNlclVwZGF0ZSAoKSB7IHJldHVybiBzaG93VXNlclVwZGF0ZTsgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgcCA9IHByb3BlcnRpZXM7XG5cbiAgICBwLnJvb21zLnNldCA9IGZ1bmN0aW9uIChpZCwgcm9vbSkge1xuICAgICAgc2hvd1Jvb20ocm9vbSk7XG4gICAgICByZXR1cm4gTWFwLnByb3RvdHlwZS5zZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgcC5yb29tcy5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdoaWxlIChwLmVscy5yb29tTGlzdC5maXJzdENoaWxkKSB7XG4gICAgICAgIHAuZWxzLnJvb21MaXN0LnJlbW92ZUNoaWxkKHAuZWxzLnJvb21MaXN0LmZpcnN0Q2hpbGQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIE1hcC5wcm90b3R5cGUuY2xlYXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgcC5yb29tcy5kZWxldGUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHVuc2hvd1Jvb21VcGRhdGUoaWQpO1xuICAgICAgcmV0dXJuIE1hcC5wcm90b3R5cGUuZGVsZXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIHAudXNlcnMuc2V0ID0gZnVuY3Rpb24gKGlkLCB1c2VyKSB7XG4gICAgICBzaG93VXNlcih1c2VyKTtcbiAgICAgIHJldHVybiBNYXAucHJvdG90eXBlLnNldC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBwLnVzZXJzLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgd2hpbGUgKHAuZWxzLnVzZXJMaXN0LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgcC5lbHMudXNlckxpc3QucmVtb3ZlQ2hpbGQocC5lbHMudXNlckxpc3QuZmlyc3RDaGlsZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gTWFwLnByb3RvdHlwZS5jbGVhci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBwLnVzZXJzLmRlbGV0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgdW5zaG93VXNlclVwZGF0ZShpZCk7XG4gICAgICByZXR1cm4gTWFwLnByb3RvdHlwZS5kZWxldGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHA7XG4gIH0pKCk7XG5cblxuICBsaXN0ZW5Ub1NlcnZlcigpO1xuXG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTG9iYnk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL21vZHVsZXMvY2xpZW50L2xvYmJ5LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG5cbmNvbnN0IFJvb20gPSAocHJvcGVydGllcywgbG9iYnkpID0+IHtcbiAgY29uc3Qgc2VsZiA9IG5ldyBQcm94eShwcm9wZXJ0aWVzLCB7XG4gICAgc2V0OiAob2JqLCBwcm9wLCB2YWwpID0+IHtcbiAgICAgIG9ialtwcm9wXSA9IHZhbDtcbiAgICAgIGxvYmJ5LnNob3dSb29tVXBkYXRlKHNlbGYsIHByb3ApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gc2VsZjtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBSb29tO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9tb2R1bGVzL2NsaWVudC9yb29tLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG5cbmNvbnN0IFVzZXIgPSAocHJvcGVydGllcyA9IHt9LCBsb2JieSkgPT4ge1xuICBjb25zdCBzZWxmID0gbmV3IFByb3h5KHByb3BlcnRpZXMsIHtcbiAgICBzZXQ6IChvYmosIHByb3AsIHZhbCkgPT4ge1xuICAgICAgb2JqW3Byb3BdID0gdmFsO1xuICAgICAgbG9iYnkuc2hvd1VzZXJVcGRhdGUoc2VsZiwgcHJvcCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBzZWxmO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL21vZHVsZXMvY2xpZW50L3VzZXIuanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IExvY2FsTGV2ZWwgPSByZXF1aXJlKFwiLi9sb2NhbC1sZXZlbFwiKSxcbiAgICAgIExvY2FsVXNlciA9IHJlcXVpcmUoXCIuL2xvY2FsLXVzZXJcIik7XG5cblxuY29uc3QgTG9jYWxSb29tID0gKGFwcCwgbG9iYnksIGRhdGEpID0+IHtcbiAgY29uc3QgbGlzdGVuVG9TZXJ2ZXIgPSAoKSA9PiB7XG4gICAgYXBwLnNvY2tldC5vbihcImxvYWRMb2NhbExldmVsXCIsIGxvYWRMb2NhbExldmVsKTtcbiAgICBhcHAuc29ja2V0Lm9uKFwibG9hZExvY2FsVXNlclwiLCBsb2FkVXNlcik7XG4gICAgYXBwLnNvY2tldC5vbihcInN5bmNBdmF0YXJcIiwgc3luY0F2YXRhcik7XG4gICAgYXBwLnNvY2tldC5vbihcInN5bmNMb2NhbFJvb21cIiwgc3luY1Jvb20pO1xuICAgIGFwcC5zb2NrZXQub24oXCJzeW5jTG9jYWxVc2VyXCIsIHN5bmNVc2VyKTtcbiAgICBhcHAuc29ja2V0Lm9uKFwidW5sb2FkTG9jYWxVc2VyXCIsIHVubG9hZFVzZXIpO1xuICB9O1xuXG4gIGNvbnN0IGxpc3RlblRvVXNlciA9ICgpID0+IHtcbiAgICBzZWxmLmVscy5sZWF2ZVJvb20uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHVubG9hZCk7XG4gICAgc2VsZi5lbHMuc3RhcnRHYW1lLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhcHAudXNlci5zdGFydEdhbWUpO1xuICB9O1xuXG4gIGNvbnN0IGxvYWQgPSAoZGF0YSkgPT4ge1xuICAgIHNlbGYuZWxzID0ge1xuICAgICAgbGVhdmVSb29tOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb20tdmlldy1sZWF2ZVwiKSxcbiAgICAgIHN0YXJ0R2FtZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb29tLXZpZXctc3RhcnRcIiksXG4gICAgICB1c2VyTGlzdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb29tLXZpZXctdXNlcnNcIilcbiAgICB9O1xuXG4gICAgYXBwLnVzZXIucm9vbSA9IHNlbGY7XG4gICAgZGF0YS51c2Vycy5mb3JFYWNoKCh1c2VyKSA9PiBsb2FkVXNlcih1c2VyKSk7XG4gICAgT2JqZWN0LmFzc2lnbihzZWxmLCBkYXRhLnByb3BzKTtcblxuICAgIGNvbnN0IGVsID0gc2VsZi5lbHMudXNlckxpc3QucXVlcnlTZWxlY3RvcihgW2RhdGEtaWQ9XCIke2FwcC51c2VyLmlkfVwiXWApO1xuICAgIGVsLmNsYXNzTGlzdC5hZGQoXCJwZXJzb25hbFwiKTtcblxuICAgIGxpc3RlblRvU2VydmVyKCk7XG4gICAgbGlzdGVuVG9Vc2VyKCk7XG4gICAgYXBwLnZpZXcgPSBcInJvb21cIjtcbiAgfTtcblxuICBjb25zdCBsb2FkTG9jYWxMZXZlbCA9IChkYXRhKSA9PiB7XG4gICAgc2VsZi5sZXZlbCA9IExvY2FsTGV2ZWwoYXBwLCBzZWxmLCBkYXRhKTtcbiAgfTtcblxuICBjb25zdCBsb2FkVXNlciA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgbG9jYWxVc2VyID0gTG9jYWxVc2VyKGFwcCwgbG9iYnkudXNlcnMuZ2V0KGRhdGEuaWQpLCBzZWxmKTtcbiAgICBzZWxmLnVzZXJzLnNldChsb2NhbFVzZXIuaWQsIGxvY2FsVXNlcik7XG4gICAgT2JqZWN0LmFzc2lnbihsb2NhbFVzZXIsIGRhdGEucHJvcHMpO1xuICAgIE9iamVjdC5hc3NpZ24obG9jYWxVc2VyLmF2YXRhciwgZGF0YS5hdmF0YXIucHJvcHMpO1xuICB9O1xuXG4gIGNvbnN0IHNob3dVc2VyID0gKHsgaWQsIG5hbWUgfSkgPT4ge1xuICAgIHNlbGYuZWxzLnVzZXJMaXN0Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLFxuICAgICAgICBgPGxpIGRhdGEtaWQ9XCIke2lkfVwiPmAgK1xuICAgICAgICAgIGA8c3BhbiBjbGFzcz1cIm5hbWVcIj4ke25hbWV9PC9zcGFuPmAgK1xuICAgICAgICBgPC9saT5gKTtcbiAgfTtcblxuICBjb25zdCBzaG93VXNlclVwZGF0ZSA9ICh1c2VyLCBwcm9wKSA9PiB7XG4gICAgY29uc3Qgc2hvd25JblJvb20gPSBuZXcgU2V0KFtcIm5hbWVcIl0pO1xuXG4gICAgaWYgKHNob3duSW5Sb29tLmhhcyhwcm9wKSkge1xuICAgICAgY29uc3QgZWwgPSBzZWxmLmVscy51c2VyTGlzdC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1pZD1cIiR7dXNlci5pZH1cIl0gLiR7cHJvcH1gKTtcbiAgICAgIGVsLmlubmVyVGV4dCA9IHVzZXJbcHJvcF07XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHN5bmNBdmF0YXIgPSAoZGF0YSkgPT4ge1xuICAgIHNlbGYudXNlcnMuZ2V0KGRhdGEuaWQpLmF2YXRhci5zeW5jKGRhdGEpO1xuICB9O1xuXG4gIGNvbnN0IHN5bmNSb29tID0gKGRhdGEpID0+IHtcbiAgICBPYmplY3QuYXNzaWduKHNlbGYsIGRhdGEucHJvcHMpO1xuICB9O1xuXG4gIGNvbnN0IHN5bmNVc2VyID0gKGRhdGEpID0+IHtcbiAgICBPYmplY3QuYXNzaWduKHNlbGYudXNlcnMuZ2V0KGRhdGEuaWQpLCBkYXRhLnByb3BzKTtcbiAgfTtcblxuICBjb25zdCB1bmxpc3RlblRvU2VydmVyID0gKCkgPT4ge1xuICAgIGFwcC5zb2NrZXQub2ZmKFwibG9hZExvY2FsTGV2ZWxcIiwgbG9hZExvY2FsTGV2ZWwpO1xuICAgIGFwcC5zb2NrZXQub2ZmKFwibG9hZExvY2FsVXNlclwiLCBsb2FkVXNlcik7XG4gICAgYXBwLnNvY2tldC5vZmYoXCJzeW5jQXZhdGFyXCIsIHN5bmNBdmF0YXIpO1xuICAgIGFwcC5zb2NrZXQub2ZmKFwic3luY0xvY2FsUm9vbVwiLCBzeW5jUm9vbSk7XG4gICAgYXBwLnNvY2tldC5vZmYoXCJzeW5jTG9jYWxVc2VyXCIsIHN5bmNVc2VyKTtcbiAgICBhcHAuc29ja2V0Lm9mZihcInVubG9hZExvY2FsVXNlclwiLCB1bmxvYWRVc2VyKTtcbiAgfTtcblxuICBjb25zdCB1bmxpc3RlblRvVXNlciA9ICgpID0+IHtcbiAgICBzZWxmLmVscy5sZWF2ZVJvb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHVubG9hZCk7XG4gICAgc2VsZi5lbHMuc3RhcnRHYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhcHAudXNlci5zdGFydEdhbWUpO1xuICB9O1xuXG4gIGNvbnN0IHVuc2hvd1VzZXIgPSAoaWQpID0+IHtcbiAgICBjb25zdCBsaSA9IHNlbGYuZWxzLnVzZXJMaXN0LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWlkPSR7aWR9XWApO1xuICAgIGxpLnJlbW92ZSgpO1xuICB9O1xuXG4gIGNvbnN0IHVubG9hZCA9ICgpID0+IHtcbiAgICBhcHAuc29ja2V0LmVtaXQoXCJsZWF2ZVJvb21cIik7XG4gICAgdW5saXN0ZW5Ub1NlcnZlcigpO1xuICAgIHVubGlzdGVuVG9Vc2VyKCk7XG4gICAgdW5sb2FkTGV2ZWwoKTtcbiAgICB1bmxvYWRVc2VycygpO1xuICAgIGFwcC52aWV3ID0gXCJsb2JieVwiO1xuICB9O1xuXG4gIGNvbnN0IHVubG9hZExldmVsID0gKCkgPT4ge1xuICAgIGlmIChzZWxmLmxldmVsKSB7XG4gICAgICBzZWxmLmxldmVsLnVubG9hZCgpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCB1bmxvYWRVc2VyID0gKGlkKSA9PiB7XG4gICAgc2VsZi51c2Vycy5kZWxldGUoaWQpO1xuICB9O1xuXG4gIGNvbnN0IHVubG9hZFVzZXJzID0gKCkgPT4ge1xuICAgIHNlbGYudXNlcnMuY2xlYXIoKTtcbiAgfTtcblxuXG4gIGNvbnN0IHNlbGYgPSAoKCkgPT4ge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7XG4gICAgICBlbHM6IHVuZGVmaW5lZCxcbiAgICAgIHVzZXJzOiBuZXcgTWFwKCksXG5cbiAgICAgIGdldCBzaG93VXNlclVwZGF0ZSAoKSB7IHJldHVybiBzaG93VXNlclVwZGF0ZTsgfSxcbiAgICAgIGdldCB1bmxvYWQgKCkgeyByZXR1cm4gdW5sb2FkOyB9XG4gICAgfTtcblxuICAgIGNvbnN0IHAgPSBuZXcgUHJveHkocHJvcGVydGllcywge1xuICAgICAgc2V0OiAob2JqLCBwcm9wLCB2YWwpID0+IHtcbiAgICAgICAgb2JqW3Byb3BdID0gdmFsO1xuXG4gICAgICAgIGlmIChwcm9wID09PSBcIm93bmVySWRcIikge1xuICAgICAgICAgIGNvbnN0IGVsID0gcC5lbHMudXNlckxpc3QucXVlcnlTZWxlY3RvcihgW2RhdGEtaWQ9XCIke3ZhbH1cIl1gKTtcbiAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKFwib3duZXJcIik7XG5cbiAgICAgICAgICBpZiAodmFsID09PSBhcHAudXNlci5pZCkge1xuICAgICAgICAgICAgcC5lbHMuc3RhcnRHYW1lLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcC5lbHMuc3RhcnRHYW1lLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwLnVzZXJzLnNldCA9IGZ1bmN0aW9uIChpZCwgdXNlcikge1xuICAgICAgc2hvd1VzZXIodXNlcik7XG4gICAgICByZXR1cm4gTWFwLnByb3RvdHlwZS5zZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgcC51c2Vycy5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdoaWxlIChwLmVscy51c2VyTGlzdC5maXJzdENoaWxkKSB7XG4gICAgICAgIHAuZWxzLnVzZXJMaXN0LnJlbW92ZUNoaWxkKHAuZWxzLnVzZXJMaXN0LmZpcnN0Q2hpbGQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIE1hcC5wcm90b3R5cGUuY2xlYXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgcC51c2Vycy5kZWxldGUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHVuc2hvd1VzZXIoaWQpO1xuICAgICAgcmV0dXJuIE1hcC5wcm90b3R5cGUuZGVsZXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIHJldHVybiBwO1xuICB9KSgpO1xuXG5cbiAgbG9hZChkYXRhKTtcblxuXG4gIHJldHVybiBzZWxmO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsUm9vbTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbW9kdWxlcy9jbGllbnQvbG9jYWwtcm9vbS5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3QgVGlsZSA9IHJlcXVpcmUoXCIuL3RpbGVcIik7XG5cblxuY29uc3QgTG9jYWxMZXZlbCA9IChhcHAsIHJvb20sIGRhdGEpID0+IHtcbiAgY29uc3QgaW5pdENhbnZhcyA9ICgpID0+IHtcbiAgICBjb25zdCBpbml0VGV4dCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHN0eWxlID0gbmV3IFBJWEkuVGV4dFN0eWxlKHtcbiAgICAgICAgZmlsbDogXCJ5ZWxsb3dcIixcbiAgICAgICAgZm9udFNpemU6IDE2XG4gICAgICB9KTtcblxuICAgICAgbXNnID0gbmV3IFBJWEkuVGV4dChcIi4uLlwiLCBzdHlsZSk7XG4gICAgICBtc2cucG9zaXRpb24uc2V0KDUsIDUpO1xuICAgICAgZ2Z4LnN0YWdlLmFkZENoaWxkKG1zZyk7XG4gICAgfTtcblxuICAgIGNvbnN0IGluaXRUaWxlVGV4dHVyZXMgPSAoKSA9PiB7XG4gICAgICBjb25zdCB0ZXh0dXJlID0gUElYSS5sb2FkZXIucmVzb3VyY2VzW1wiaW1hZ2VzL3RpbGVzLnBuZ1wiXS50ZXh0dXJlO1xuICAgICAgY29uc3QgcmVjdCA9IG5ldyBQSVhJLlJlY3RhbmdsZSgxOTIsIDEyOCwgNjQsIDY0KTtcblxuICAgICAgdGV4dHVyZS5mcmFtZSA9IHJlY3Q7XG4gICAgfTtcblxuICAgIGNvbnN0IGluaXRUZXh0dXJlcyA9ICgpID0+IHtcbiAgICAgIC8vIGluaXRUaWxlVGV4dHVyZXMoKTtcblxuXG4gICAgICAvLyBpbml0VGlsZVNwcml0ZXMoKTtcbiAgICAgIGluaXRBdmF0YXJTcHJpdGVzKCk7XG4gICAgICBnZngudGlja2VyLmFkZChkZWx0YSA9PiBnYW1lTG9vcChkZWx0YSkpO1xuICAgIH07XG5cblxuICAgIGNvbnN0IGltYWdlRmlsZXMgPSBbXG4gICAgICAgICAgICB7IG5hbWU6IFwiYXZhdGFyXCIsIHVybDogXCJpbWFnZXMvYXZhdGFyLnBuZ1wiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwidGlsZXNcIiwgdXJsOiBcImltYWdlcy90aWxlcy5wbmdcIiB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBwaXhpT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHdpZHRoOiA2MDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDYwMFxuICAgICAgICAgIH07XG5cbiAgICBnZnggPSBuZXcgUElYSS5BcHBsaWNhdGlvbihwaXhpT3B0aW9ucyk7XG4gICAgZ2Z4LnJlbmRlcmVyLmJhY2tncm91bmRDb2xvciA9IDB4NTU1NUJCO1xuXG4gICAgaW5pdFRleHQoKTtcblxuICAgIFBJWEkubG9hZGVyLmFkZChpbWFnZUZpbGVzKVxuICAgICAgICAvLy8vIC5vbihcInByb2dyZXNzXCIsIHNwcml0ZVByb2dyZXNzKVxuICAgICAgICAubG9hZChpbml0VGV4dHVyZXMpO1xuICAgIGFwcC5lbHMuZ2FtZS5hcHBlbmRDaGlsZChnZngudmlldyk7XG4gIH07XG5cbiAgY29uc3QgZHJhdyA9ICgpID0+IHtcbiAgICBjb25zdCB6ID0gc2VsZi5yb29tLnVzZXJzLmdldChhcHAudXNlci5pZCkuYXZhdGFyO1xuXG4gICAgbXNnLnRleHQgPSBgJHtNYXRoLnJvdW5kKHoueCl9LCR7TWF0aC5yb3VuZCh6LnkpfSBAICR7ei5zcGVlZH1gO1xuXG4gICAgcm9vbS51c2Vycy5mb3JFYWNoKCh1c2VyKSA9PiB7XG4gICAgICBjb25zdCBhdmF0YXIgPSB1c2VyLmF2YXRhcjtcbiAgICAgIHNlbGYuc3ByaXRlcy5nZXQodXNlci5pZCkucG9zaXRpb24uc2V0KGF2YXRhci54LCBhdmF0YXIueSk7XG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3QgZ2FtZUxvb3AgPSAoZGVsdGEpID0+IHtcbiAgICBpbnRlcnBvbGF0ZShkZWx0YSk7XG4gICAgZHJhdygpO1xuICB9O1xuXG4gIGNvbnN0IGluaXRBdmF0YXJTcHJpdGVzID0gKCkgPT4ge1xuICAgIHJvb20udXNlcnMuZm9yRWFjaCgodXNlcikgPT4ge1xuICAgICAgY29uc3QgdGV4dHVyZSA9IFBJWEkubG9hZGVyLnJlc291cmNlcy5hdmF0YXIudGV4dHVyZTtcbiAgICAgIGNvbnN0IHNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0ZXh0dXJlKTtcbiAgICAgIHNlbGYuc3ByaXRlcy5zZXQodXNlci5pZCwgc3ByaXRlKTtcbiAgICAgIGdmeC5zdGFnZS5hZGRDaGlsZChzZWxmLnNwcml0ZXMuZ2V0KHVzZXIuaWQpKTtcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBpbml0VGlsZVNwcml0ZXMgPSAoKSA9PiB7XG4gICAgc2VsZi50aWxlcy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgIHJvdy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgIC8vLy90aWxlLnR5cGVcbiAgICAgICAgY29uc3QgdGV4dHVyZSA9IFBJWEkubG9hZGVyLnJlc291cmNlc1tcInRpbGVcIiArIHRpbGUudHlwZV0udGV4dHVyZTtcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRleHR1cmUpO1xuICAgICAgICBnZnguc3RhZ2UuYWRkQ2hpbGQoc3ByaXRlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IGludGVycG9sYXRlID0gKGRlbHRhKSA9PiB7XG4gICAgY29uc3QgbXMgPSBkZWx0YSAvIDYwICogMTAwMDtcblxuICAgIHJvb20udXNlcnMuZm9yRWFjaCgodXNlcikgPT4ge1xuICAgICAgdXNlci5hdmF0YXIudGljayhtcyk7XG4gICAgfSk7XG4gIH07XG5cblxuXG5cblxuXG5cbiAgY29uc3QgbGlzdGVuVG9TZXJ2ZXIgPSAoKSA9PiB7XG4gICAgLy8vL1xuICB9O1xuXG4gIGNvbnN0IGxpc3RlblRvVXNlciA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBhcHAudXNlci5hdmF0YXIuc3RhcnRBY3Rpb24pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBhcHAudXNlci5hdmF0YXIuZW5kQWN0aW9uKTtcbiAgfTtcblxuICBjb25zdCBsb2FkID0gKGRhdGEpID0+IHtcbiAgICBPYmplY3QuYXNzaWduKHNlbGYsIGRhdGEucHJvcHMpO1xuICAgIGxpc3RlblRvU2VydmVyKCk7XG4gICAgbGlzdGVuVG9Vc2VyKCk7XG5cbiAgICAvLy8vXG4gICAgLy8gdGlsZXNcbiAgICBzZWxmLnRpbGVzID0gZGF0YS50aWxlcy5tYXAoKHJvdykgPT4ge1xuICAgICAgcmV0dXJuIHJvdy5tYXAoKHRpbGUpID0+IFRpbGUodGlsZSkpO1xuICAgIH0pO1xuXG4gICAgaW5pdENhbnZhcygpO1xuICAgIGFwcC51c2VyLmF2YXRhci5sb2FkKCk7XG4gICAgYXBwLnZpZXcgPSBcImdhbWVcIjtcbiAgfTtcblxuICBjb25zdCB1bmxpc3RlblRvU2VydmVyID0gKCkgPT4ge1xuICAgIC8vLy9cbiAgfTtcblxuICBjb25zdCB1bmxpc3RlblRvVXNlciA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBhcHAudXNlci5hdmF0YXIuc3RhcnRBY3Rpb24pO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBhcHAudXNlci5hdmF0YXIuZW5kQWN0aW9uKTtcbiAgfTtcblxuICBjb25zdCB1bmxvYWQgPSAoKSA9PiB7XG4gICAgZ2Z4LnRpY2tlci5kZXN0cm95KCk7XG4gICAgdW5saXN0ZW5Ub1NlcnZlcigpO1xuICAgIHVubGlzdGVuVG9Vc2VyKCk7XG4gICAgYXBwLnZpZXcgPSBcInJvb21cIjtcbiAgfTtcblxuXG4gIGxldCBnZngsXG4gICAgICBtc2c7XG5cblxuICBjb25zdCBzZWxmID0gKCgpID0+IHtcbiAgICBjb25zdCBlZGl0YWJsZSA9IG5ldyBTZXQoW1wicGF1c2VkXCJdKTtcblxuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7XG4gICAgICByb29tLFxuICAgICAgc3ByaXRlczogbmV3IE1hcCgpLFxuICAgICAgdGlsZXM6IFtdLFxuXG4gICAgICBnZXQgdW5sb2FkICgpIHsgcmV0dXJuIHVubG9hZDsgfVxuICAgIH07XG5cbiAgICBjb25zdCBwID0gbmV3IFByb3h5KHByb3BlcnRpZXMsIHtcbiAgICAgIHNldDogKG9iaiwgcHJvcCwgdmFsKSA9PiB7XG4gICAgICAgIGlmIChlZGl0YWJsZS5oYXMocHJvcCkpIHtcbiAgICAgICAgICBhcHAuc29ja2V0LmVtaXQoXCJzeW5jTGV2ZWxcIiwgeyBwcm9wLCB2YWwgfSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBvYmpbcHJvcF0gPSB2YWw7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHA7XG4gIH0pKCk7XG5cblxuICBsb2FkKGRhdGEpO1xuXG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTG9jYWxMZXZlbDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbW9kdWxlcy9jbGllbnQvbG9jYWwtbGV2ZWwuanNcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IHRpbGVUeXBlcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vdGlsZS10eXBlc1wiKTtcblxuXG5jb25zdCBUaWxlID0gKGRhdGEpID0+IHtcbiAgY29uc3Qgc2VsZiA9IGRhdGE7XG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVGlsZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbW9kdWxlcy9jbGllbnQvdGlsZS5qc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxuXG5jb25zdCBUaWxlVHlwZSA9ICh7XG4gIG5hbWUgPSBcInVua25vd25cIixcbiAgZGVmdXNlc0JvbWJzID0gZmFsc2UsXG4gIGV4cGxvZGVzID0gZmFsc2UsXG4gIGZhdGFsID0gZmFsc2UsXG4gIGZyaWN0aW9uID0gMSxcbiAgcmVzcGF3bnMgPSBmYWxzZSxcbiAgc29saWQgPSBmYWxzZSxcbiAgdHJpZ2dlcnNCb21icyA9IGZhbHNlLFxuICBocCA9IEluZmluaXR5LFxuICBwaWNrdXBPZGRzID0gMCxcbiAgd2VhciA9IEluZmluaXR5XG59ID0ge30pID0+IHtcbiAgY29uc3Qgc2VsZiA9ICgoKSA9PiB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5mcmVlemUoe1xuICAgICAgbmFtZSxcbiAgICAgIGRlZnVzZXNCb21icyxcbiAgICAgIGV4cGxvZGVzLFxuICAgICAgZmF0YWwsXG4gICAgICBmcmljdGlvbixcbiAgICAgIHJlc3Bhd25zLFxuICAgICAgc29saWQsXG4gICAgICB0cmlnZ2Vyc0JvbWJzLFxuICAgICAgc3RhdHM6IHtcbiAgICAgICAgaHAsXG4gICAgICAgIHBpY2t1cE9kZHMsXG4gICAgICAgIHdlYXJcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHAgPSBwcm9wZXJ0aWVzO1xuXG4gICAgcmV0dXJuIHA7XG4gIH0pKCk7XG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5cbmNvbnN0IHRpbGVUeXBlcyA9IHtcbiAgMDogVGlsZVR5cGUoe1xuICAgIG5hbWU6IFwiZ3Jhc3NcIlxuICB9KSxcbiAgMTogVGlsZVR5cGUoe1xuICAgIG5hbWU6IFwicm9ja1wiLFxuICAgIGhwOiAxLFxuICAgIHNvbGlkOiB0cnVlXG4gIH0pLFxuICAyOiBUaWxlVHlwZSh7XG4gICAgbmFtZTogXCJmaXJlXCIsXG4gICAgZmF0YWw6IHRydWUsXG4gICAgdHJpZ2dlcnNCb21iczogdHJ1ZVxuICB9KSxcbiAgMzogVGlsZVR5cGUoe1xuICAgIG5hbWU6IFwibWFyc2hcIixcbiAgICBkZWZ1c2VzQm9tYnM6IHRydWVcbiAgfSksXG4gIDQ6IFRpbGVUeXBlKHtcbiAgICBuYW1lOiBcIm1pcnJvclwiLFxuICAgIHNvbGlkOiB0cnVlXG4gIH0pLFxuICA1OiBUaWxlVHlwZSh7XG4gICAgbmFtZTogXCJvaWxcIixcbiAgICBmcmljdGlvbjogMFxuICB9KSxcbiAgNjogVGlsZVR5cGUoe1xuICAgIG5hbWU6IFwicGl0XCIsXG4gICAgZGVmdXNlc0JvbWJzOiB0cnVlLFxuICAgIGZhdGFsOiB0cnVlXG4gIH0pLFxuICA3OiBUaWxlVHlwZSh7XG4gICAgbmFtZTogXCJzdGVlbFwiLFxuICAgIHNvbGlkOiB0cnVlXG4gIH0pLFxuICA4OiBUaWxlVHlwZSh7XG4gICAgbmFtZTogXCJUTlRcIixcbiAgICBleHBsb2RlczogdHJ1ZSxcbiAgICBocDogMSxcbiAgICBzb2xpZDogdHJ1ZVxuICB9KSxcbiAgOTogVGlsZVR5cGUoe1xuICAgIG5hbWU6IFwiZmFuXCIsXG4gICAgc29saWQ6IHRydWVcbiAgfSlcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB0aWxlVHlwZXM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL21vZHVsZXMvY29tbW9uL3RpbGUtdHlwZXMuanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IExvY2FsQXZhdGFyID0gcmVxdWlyZShcIi4vbG9jYWwtYXZhdGFyXCIpO1xuXG5cbmNvbnN0IExvY2FsVXNlciA9IChhcHAsIGJhc2UsIHJvb20pID0+IHtcbiAgY29uc3Qgc2VsZiA9ICgoKSA9PiB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oe30sIGJhc2UpO1xuXG4gICAgY29uc3QgcCA9IG5ldyBQcm94eShwcm9wZXJ0aWVzLCB7XG4gICAgICBzZXQ6IChvYmosIHByb3AsIHZhbCkgPT4ge1xuICAgICAgICBvYmpbcHJvcF0gPSB2YWw7XG4gICAgICAgIHJvb20uc2hvd1VzZXJVcGRhdGUocCwgcHJvcCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcHJvcGVydGllcy5hdmF0YXIgPSBMb2NhbEF2YXRhcihhcHAsIHApO1xuXG4gICAgcmV0dXJuIHA7XG4gIH0pKCk7XG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTG9jYWxVc2VyO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9tb2R1bGVzL2NsaWVudC9sb2NhbC11c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG5cbmNvbnN0IExvY2FsQXZhdGFyID0gKGFwcCwgdXNlcikgPT4ge1xuICBjb25zdCBzeW5jID0gKGRhdGEpID0+IHtcbiAgICBPYmplY3QuYXNzaWduKHNlbGYsIGRhdGEucHJvcHMpO1xuICB9O1xuXG4gIGNvbnN0IHRpY2sgPSAobXMpID0+IHtcbiAgICBzZWxmLnggKz0gTWF0aC5jb3Moc2VsZi5yYWQpICogc2VsZi5zcGVlZCAqIG1zO1xuICAgIHNlbGYueSArPSBNYXRoLnNpbihzZWxmLnJhZCkgKiBzZWxmLnNwZWVkICogbXM7XG4gIH07XG5cblxuICBjb25zdCBzZWxmID0gKCgpID0+IHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0ge1xuICAgICAgc29ja2V0OiBhcHAuc29ja2V0LFxuICAgICAgdXNlcixcblxuICAgICAgZ2V0IHN5bmMgKCkgeyByZXR1cm4gc3luYzsgfSxcbiAgICAgIGdldCB0aWNrICgpIHsgcmV0dXJuIHRpY2s7IH1cbiAgICB9O1xuXG4gICAgY29uc3QgcCA9IG5ldyBQcm94eShwcm9wZXJ0aWVzLCB7XG4gICAgICBzZXQ6IChvYmosIHByb3AsIHZhbCkgPT4ge1xuICAgICAgICBvYmpbcHJvcF0gPSB2YWw7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHA7XG4gIH0pKCk7XG5cblxuICByZXR1cm4gc2VsZjtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbEF2YXRhcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbW9kdWxlcy9jbGllbnQvbG9jYWwtYXZhdGFyLmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3QgUGVyc29uYWxBdmF0YXIgPSByZXF1aXJlKFwiLi9wZXJzb25hbC1hdmF0YXJcIik7XG5cblxuY29uc3QgUGVyc29uYWxVc2VyID0gKGFwcCwgbG9iYnkpID0+IHtcbiAgY29uc3Qgam9pblJvb20gPSAoaWQpID0+IHtcbiAgICBhcHAuc29ja2V0LmVtaXQoXCJqb2luUm9vbVwiLCBpZCk7XG4gIH07XG5cbiAgY29uc3QgbG9hZCA9IChpZCkgPT4ge1xuICAgIHNlbGYuaWQgPSBpZDtcbiAgfTtcblxuICBjb25zdCBzdGFydEdhbWUgPSAoKSA9PiB7XG4gICAgYXBwLnNvY2tldC5lbWl0KFwic3RhcnRHYW1lXCIpO1xuICB9O1xuXG5cbiAgY29uc3Qgc2VsZiA9ICgoKSA9PiB7XG4gICAgY29uc3QgZWRpdGFibGUgPSBuZXcgU2V0KFtcImVtYWlsXCIsIFwibmFtZVwiXSk7XG5cbiAgICBjb25zdCBwcm9wZXJ0aWVzID0ge1xuICAgICAgZ2V0IGNyZWF0ZVJvb20gKCkgeyByZXR1cm4gY3JlYXRlUm9vbTsgfSxcbiAgICAgIGdldCBqb2luUm9vbSAoKSB7IHJldHVybiBqb2luUm9vbTsgfSxcbiAgICAgIGdldCBsb2FkICgpIHsgcmV0dXJuIGxvYWQ7IH0sXG4gICAgICBnZXQgbG9naW4gKCkgeyByZXR1cm4gbG9naW47IH0sXG4gICAgICBnZXQgc3RhcnRHYW1lICgpIHsgcmV0dXJuIHN0YXJ0R2FtZTsgfVxuICAgIH07XG5cbiAgICBjb25zdCBwID0gbmV3IFByb3h5KHByb3BlcnRpZXMsIHtcbiAgICAgIHNldDogKG9iaiwgcHJvcCwgdmFsKSA9PiB7XG4gICAgICAgIGlmIChlZGl0YWJsZS5oYXMocHJvcCkpIHtcbiAgICAgICAgICBhcHAuc29ja2V0LmVtaXQoXCJzeW5jVXNlclwiLCB7IHByb3AsIHZhbCB9KTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9ialtwcm9wXSA9IHZhbDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwcm9wZXJ0aWVzLmF2YXRhciA9IFBlcnNvbmFsQXZhdGFyKGFwcCwgcCk7XG5cbiAgICByZXR1cm4gcDtcbiAgfSkoKTtcblxuXG4gIHJldHVybiBzZWxmO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBlcnNvbmFsVXNlcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbW9kdWxlcy9jbGllbnQvcGVyc29uYWwtdXNlci5qc1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cblxuY29uc3QgUGVyc29uYWxBdmF0YXIgPSAoYXBwLCB1c2VyKSA9PiB7XG4gIGNvbnN0IGVuZEFjdGlvbiA9IChlKSA9PiB7XG4gICAgY29uc3QgYSA9IHNlbGYuaW5wdXQuZ2V0KGUua2V5KTtcblxuICAgIGlmIChhICYmIHNlbGYuYWN0aW9ucy5oYXMoYSkpIHtcbiAgICAgIHNlbGYuYWN0aW9ucy5kZWxldGUoYSk7XG5cbiAgICAgIHN3aXRjaCAoYSkge1xuICAgICAgICBjYXNlIFwibW92ZVVwXCI6XG4gICAgICAgIGNhc2UgXCJtb3ZlUmlnaHRcIjpcbiAgICAgICAgY2FzZSBcIm1vdmVEb3duXCI6XG4gICAgICAgIGNhc2UgXCJtb3ZlTGVmdFwiOlxuICAgICAgICAgIGlmICghc2VsZi5hY3Rpb25zLmhhcyhcIm1vdmVVcFwiKSAmJlxuICAgICAgICAgICAgICAhc2VsZi5hY3Rpb25zLmhhcyhcIm1vdmVSaWdodFwiKSAmJlxuICAgICAgICAgICAgICAhc2VsZi5hY3Rpb25zLmhhcyhcIm1vdmVEb3duXCIpICYmXG4gICAgICAgICAgICAgICFzZWxmLmFjdGlvbnMuaGFzKFwibW92ZUxlZnRcIikpIHtcbiAgICAgICAgICAgIHNlbGYuc3BlZWQgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3QgbG9hZCA9ICgpID0+IHtcbiAgICBzZWxmLmxvY2FsID0gdXNlci5yb29tLnVzZXJzLmdldCh1c2VyLmlkKS5hdmF0YXI7XG4gIH07XG5cbiAgY29uc3Qgc3RhcnRBY3Rpb24gPSAoZSkgPT4ge1xuICAgIGNvbnN0IGEgPSBzZWxmLmlucHV0LmdldChlLmtleSk7XG5cbiAgICBpZiAoYSAmJiAhc2VsZi5hY3Rpb25zLmhhcyhhKSkge1xuICAgICAgc2VsZi5hY3Rpb25zLmFkZChhKTtcblxuICAgICAgc3dpdGNoIChhKSB7XG4gICAgICAgIGNhc2UgXCJkcm9wQm9tYlwiOlxuICAgICAgICAgIGFwcC5zb2NrZXQuZW1pdChhKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm1vdmVVcFwiOlxuICAgICAgICAgIHNlbGYucmFkID0gTWF0aC5QSSAqIDMvMjtcbiAgICAgICAgICBzZWxmLnNwZWVkID0gc2VsZi5sb2NhbC5zcGVlZExpbWl0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibW92ZVJpZ2h0XCI6XG4gICAgICAgICAgc2VsZi5yYWQgPSAwO1xuICAgICAgICAgIHNlbGYuc3BlZWQgPSBzZWxmLmxvY2FsLnNwZWVkTGltaXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJtb3ZlRG93blwiOlxuICAgICAgICAgIHNlbGYucmFkID0gTWF0aC5QSSAqIDEvMjtcbiAgICAgICAgICBzZWxmLnNwZWVkID0gc2VsZi5sb2NhbC5zcGVlZExpbWl0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibW92ZUxlZnRcIjpcbiAgICAgICAgICBzZWxmLnJhZCA9IE1hdGguUEk7XG4gICAgICAgICAgc2VsZi5zcGVlZCA9IHNlbGYubG9jYWwuc3BlZWRMaW1pdDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInBhdXNlR2FtZVwiOlxuICAgICAgICAgIHNlbGYubGV2ZWwucGF1c2VkID0gIXNlbGYubGV2ZWwucGF1c2VkO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuXG4gIGNvbnN0IHNlbGYgPSAoKCkgPT4ge1xuICAgIGNvbnN0IGVkaXRhYmxlID0gbmV3IFNldChbXCJyYWRcIiwgXCJzcGVlZFwiXSk7XG5cbiAgICBjb25zdCBwcm9wZXJ0aWVzID0ge1xuICAgICAgYWN0aW9uczogbmV3IFNldCgpLFxuICAgICAgaW5wdXQ6IG5ldyBNYXAoW1xuICAgICAgICBbXCIgXCIsIFwiZHJvcEJvbWJcIl0sXG4gICAgICAgIFtcIkFycm93VXBcIiwgXCJtb3ZlVXBcIl0sXG4gICAgICAgIFtcIkFycm93UmlnaHRcIiwgXCJtb3ZlUmlnaHRcIl0sXG4gICAgICAgIFtcIkFycm93RG93blwiLCBcIm1vdmVEb3duXCJdLFxuICAgICAgICBbXCJBcnJvd0xlZnRcIiwgXCJtb3ZlTGVmdFwiXSxcbiAgICAgICAgW1wicFwiLCBcInBhdXNlR2FtZVwiXVxuICAgICAgXSksXG4gICAgICB1c2VyLFxuXG4gICAgICBnZXQgZW5kQWN0aW9uICgpIHsgcmV0dXJuIGVuZEFjdGlvbjsgfSxcbiAgICAgIGdldCBsb2FkICgpIHsgcmV0dXJuIGxvYWQ7IH0sXG4gICAgICBnZXQgc3RhcnRBY3Rpb24gKCkgeyByZXR1cm4gc3RhcnRBY3Rpb247IH0sXG5cbiAgICAgIGdldCBsZXZlbCAoKSB7IHJldHVybiBzZWxmLnVzZXIucm9vbS5sZXZlbDsgfVxuICAgIH07XG5cbiAgICBjb25zdCBwID0gbmV3IFByb3h5KHByb3BlcnRpZXMsIHtcbiAgICAgIHNldDogKG9iaiwgcHJvcCwgdmFsKSA9PiB7XG4gICAgICAgIGlmIChlZGl0YWJsZS5oYXMocHJvcCkpIHtcbiAgICAgICAgICBhcHAuc29ja2V0LmVtaXQoXCJzeW5jQXZhdGFyXCIsIHsgcHJvcCwgdmFsIH0pO1xuICAgICAgICAgIHNlbGYubG9jYWxbcHJvcF0gPSB2YWw7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBvYmpbcHJvcF0gPSB2YWw7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHA7XG4gIH0pKCk7XG5cblxuICByZXR1cm4gc2VsZjtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQZXJzb25hbEF2YXRhcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbW9kdWxlcy9jbGllbnQvcGVyc29uYWwtYXZhdGFyLmpzXG4vLyBtb2R1bGUgaWQgPSAxMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9