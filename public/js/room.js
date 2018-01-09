"use strict";


const Room = (properties, socket) => {
  const displayed = new Set(["name", "maxUsers", "numUsers"]);

  const els = {
    roomList: document.getElementById("lobby-view-rooms")
  };

  const self = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "socket") return socket;
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;

      if (displayed.has(prop)) {
        const el = els.roomList.querySelector(`[data-id="${self.id}"] .${prop}`);
        el.innerText = val;
      }

      return true;
    }
  });

  return self;
};

const LocalRoom = (properties, syncData) => {
  const listUser = ({ id, name }) => {
    els.userList.insertAdjacentHTML("beforeend",
        `<li data-id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const unlistUser = (id) => {
    console.log("unlist", id);
    const li = els.userList.querySelector(`[data-id=${id}]`);
    li.remove();
  };


  const actions = {
    " ": ["dropBomb", false],
    "ArrowUp": ["moveUp", false],
    "ArrowRight": ["moveRight", false],
    "ArrowDown": ["moveDown", false],
    "ArrowLeft": ["moveLeft", false]
  };

  const endAction = (action) => {
    action[1] = false;

    switch (action[0]) {
      case "moveUp":
      case "moveRight":
      case "moveDown":
      case "moveLeft":
        self.socket.emit("halt");
        break;
    }
  };

  const startAction = (action) => {
    console.log("start:", action[0]);

    action[1] = true;

    switch (action[0]) {
      case "dropBomb":
        self.socket.emit("dropBomb");
        break;
      case "moveUp":
        self.socket.emit("move", 270);
        break;
      case "moveRight":
        self.socket.emit("move", 0);
        break;
    }
  };

  properties.users = new Map();

  const els = {
    userList: document.getElementById("room-view-users")
  };

  const self = new Proxy(properties, {
    get: (obj, prop) => {
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;
      return true;
    }
  });

  self.users.set = (...args) => {
    listUser(args[1]);
    return Map.prototype.set.apply(self.users, args);
  };

  self.users.clear = (...args) => {
    while (els.userList.firstChild) {
      els.userList.removeChild(els.userList.firstChild);
    }
    return Map.prototype.clear.apply(self.users, args);
  };

  self.users.delete = (...args) => {
    unlistUser(args[0]);
    return Map.prototype.delete.apply(self.users, args);
  };


  syncData.users.forEach((data) => {
    self.users.set(data.id, data);
  });




  self.socket.on("addRoomUser", (...users) => {
    users.forEach((data) => {
      const user = User(data, self.socket);
      self.users.set(user.id, user);
    });

    return;
  });

  self.socket.on("deleteRoomUser", (...ids) => {
    ids.forEach((id)  => {
      self.users.delete(id);
    });
  });

  self.socket.on("updateLocalRoom", (data) => {
    //// console.log("update room:", data);
  });


  document.addEventListener("keydown", (e) => {
    const action = actions[e.key];

    if (action && !action[1]) {
      startAction(action);
    }

    ////client.avatar.move(angle);
  });

  document.addEventListener("keyup", (e) => {
    const action = actions[e.key];

    if (action) {
      endAction(action);
    }
  });


  return self;
};
