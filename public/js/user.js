"use strict";


const User = (properties, socket) => {
  const shownInLobby = new Set(["name"]),
        shownInRoom = new Set(["name"]);

  const els = {
    lobbyUserList: document.getElementById("lobby-view-users"),
    roomUserList: document.getElementById("room-view-users")
  };

  const self = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "socket") return socket;
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;

      if (shownInLobby.has(prop)) {
        const el = els.lobbyUserList.querySelector(`[data-id="${self.id}"] .${prop}`);
        el.innerText = val;
      }

      if (shownInRoom.has(prop)) {
        console.log(prop, val);
        // const el = els.roomUserList.querySelector(`[data-id="${self.id}"] .${prop}`);
        // el.innerText = val;
      }

      return true;
    }
  });

  return self;
};

const LocalUser = (lobby) => {
  const leaveRoom = () => {
    self.room.unload();
  };

  const load = (base) => {
    Object.assign(properties, base);
  };


  const editable = new Set(["email", "name"]);

  const els = {
    leaveRoom: document.getElementById("room-view-leave")
  };

  const properties = {
    room: LocalRoom(lobby),
    socket: lobby.socket,

    get leaveRoom () { return leaveRoom; },
    get load () { return load; }
  };

  const self = new Proxy(properties, {
    get: (obj, prop) => {
      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (prop === "room") {
        obj[prop] = val;
        return true;
      }
      else if (editable.has(prop)) {
        self.socket.emit("updateUser", { prop, val });
        return true;
      }

      return false;
    }
  });

  els.leaveRoom.addEventListener("click", (e) => {
    leaveRoom();
  });


  return self;
};
