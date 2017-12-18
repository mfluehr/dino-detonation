"use strict";


const RoomBase = (properties, lobbyIo) => {
  properties.lobbyIo = lobbyIo;
  return properties;
};

const Room = (properties, lobbyIo) => {
  const base = RoomBase(properties, lobbyIo),
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

const LocalRoom = (base, syncData) => {
  const els = {
    leaveRoom: document.getElementById("room-view-leave"),
    userList: document.getElementById("room-view-users")
  };

  const properties = Object.assign({
    roomIo: io.connect(`${url}/${base.id}`),
    users: new Map()
  }, base);

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

  syncData.users.forEach((data) => {
    p.users.set(data.id, data);
  });

  console.log(p);





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


  const leaveRoom = () => {
    p.roomIo.emit("leaveRoom", p.id);
    app.view = "lobby";
  };

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


  p.roomIo.on("disconnect", (reason) => {
    ////
    console.log("Room connection lost!");
  });

  p.roomIo.on("ioError", (err) => {
    console.warn(err);
  });


  p.roomIo.on("addUser", (...users) => {
    users.forEach((data) => {
      const user = User(data, p.lobbyIo);
      p.users.set(user.id, user);
      listUser(user);
    });
  });

  p.roomIo.on("deleteUser", (...ids) => {
    ids.forEach((id)  => {
      p.users.delete(id);
      unlistUser(id);
    });
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


  els.leaveRoom.addEventListener("click", (e) => {
    leaveRoom();
  });


  return p;
};
