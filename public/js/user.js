"use strict";


const User = (properties, socket) => {
  const displayed = new Set(["name"]);

  const els = {
    userList: document.getElementById("lobby-view-users")
  };

  const self = new Proxy(properties, {
    get: (obj, prop) => {
      if (prop === "socket") return socket;
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;

      if (displayed.has(prop)) {
        const el =  els.userList.querySelector(`[data-id="${self.id}"] .${prop}`);
        el.innerText = val;
      }

      return true;
    }
  });

  return self;
};

const LocalUser = (properties) => {
  const leaveRoom = () => {
    self.socket.emit("leaveRoom");
    self.room.users.clear();
    delete self.room;
    app.view = "lobby";


    ////
    self.socket.off("addRoomUser");
    self.socket.off("deleteRoomUser");
    self.socket.off("updateLocalRoom");
  };


  const editable = new Set(["email", "name"]);

  const els = {
    leaveRoom: document.getElementById("room-view-leave")
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
