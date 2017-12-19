"use strict";


const UserBase = (properties, lobbySocket) => {
  properties.lobbySocket = lobbySocket;
  return properties;
};

const User = (properties, lobbySocket) => {
  const base = UserBase(properties, lobbySocket),
        displayed = new Set(["name"]);

  const els = {
    userList: document.getElementById("lobby-view-users")
  };

  const p = new Proxy(base, {
    get: (obj, prop) => {
      if (prop === "base") return base;
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;

      if (displayed.has(prop)) {
        const el =  els.userList.querySelector(`[data-id="${p.id}"] .${prop}`);
        el.innerText = val;
      }

      return true;
    }
  });

  return p;
};

const LocalUser = (roomIo, base) => {
  // const listenToRoom = (roomIo) => {
  //   roomIo.on("disconnect", (reason) => {
  //     leaveRoom();
  //     console.log("Room connection lost!");
  //   });
  // };

  const leaveRoom = () => {
    //// p.room.roomIo.emit("leaveRoom", p.id);
    p.roomIo.emit("leaveRoom");
    p.users.clear();
    delete p.room;
    app.view = "lobby";
  };


  const editable = new Set(["email", "name"]);

  const els = {
    leaveRoom: document.getElementById("room-view-leave")
  };

  const properties = Object.assign({
    roomIo,
    users: new Map()
  }, base);

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (prop === "room") {
        obj[prop] = val;
        return true;
      }
      else if (editable.has(prop)) {
        base.lobbySocket.emit("updateUser", { prop, val });
        return true;
      }

      return false;
    }
  });

  els.leaveRoom.addEventListener("click", (e) => {
    leaveRoom();
  });


  return p;
};
