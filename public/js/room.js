"use strict";


const RoomBase = (properties, lobbySocket) => {
  properties.lobbySocket = lobbySocket;
  return properties;
};

const Room = (properties, lobbySocket) => {
  const base = RoomBase(properties, lobbySocket),
        displayed = new Set(["name", "maxUsers", "numUsers"]);

  const els = {
    roomList: document.getElementById("lobby-view-rooms")
  };

  const p = new Proxy(base, {
    get: (obj, prop) => {
      if (prop === "base") return base;
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;

      if (displayed.has(prop)) {
        const el = els.roomList.querySelector(`[data-id="${p.id}"] .${prop}`);
        el.innerText = val;
      }

      return true;
    }
  });

  return p;
};

const LocalRoom = (roomIo, base, syncData) => {
  const listUser = ({ id, name }) => {
    els.userList.insertAdjacentHTML("beforeend",
        `<li data-id="${id}">` +
          `<span class="name">${name}</span>` +
        `</li>`);
  };

  const unlistUser = (id) => {
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
        p.roomIo.emit("halt");
        break;
    }
  };

  const startAction = (action) => {
    console.log("start:", action[0]);

    action[1] = true;

    switch (action[0]) {
      case "dropBomb":
        p.roomIo.emit("dropBomb");
        break;
      case "moveUp":
        p.roomIo.emit("move", 270);
        break;
      case "moveRight":
        p.roomIo.emit("move", 0);
        break;
    }
  };

  const properties = Object.assign({
    // roomIo: io.connect(`${app.url}/${base.id}`),
    roomIo,
    users: new Map()
  }, base);

  const els = {
    userList: document.getElementById("room-view-users")
  };

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "base") return base;
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;
      return true;
    }
  });

  p.users.set = (...args) => {
    listUser(args[1]);
    return Map.prototype.set.apply(p.users, args);
  };

  p.users.clear = (...args) => {
    while (els.userList.firstChild) {
      els.userList.removeChild(els.userList.firstChild);
    }
    return Map.prototype.clear.apply(p.users, args);
  };

  p.users.delete = (...args) => {
    unlistUser(args[0]);
    return Map.prototype.delete.apply(p.users, args);
  };


  syncData.users.forEach((data) => {
    p.users.set(data.id, data);
  });




  // p.roomIo.on("addUser", (...users) => {
  //   users.forEach((data) => {
  //     const user = User(data, p.lobbySocket);
  //     p.users.set(user.id, user);
  //   });
  // });
  //
  // p.roomIo.on("deleteUser", (...ids) => {
  //   ids.forEach((id)  => {
  //     p.users.delete(id);
  //   });
  // });
  //
  // p.roomIo.on("ioError", (err) => {
  //   console.warn(err);
  // });


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





  return p;
};
