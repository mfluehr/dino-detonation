"use strict";


const LocalLevel = (room, data) => {
  const listenToServer = () => {
    self.socket.on("updateAvatar", updateAvatar);
  };

  const listenToUser = () => {
    document.addEventListener("keydown", app.user.avatar.startAction);
    document.addEventListener("keyup", app.user.avatar.endAction);
  };

  const load = (data) => {
    console.log("load", data);

    Object.assign(self, data.props);
    listenToServer();
    listenToUser();
    app.user.avatar.load();
    app.view = "game";
  };

  const unlistenToServer = () => {
    self.socket.off("updateAvatar", updateAvatar);
  };

  const unlistenToUser = () => {
    document.removeEventListener("keydown", app.user.avatar.startAction);
    document.removeEventListener("keyup", app.user.avatar.endAction);
  };

  const unload = () => {
    unlistenToServer();
    unlistenToUser();
    app.view = "room";
  };

  const updateAvatar = (data) => {
    console.log("updateAvatar", data);

    const avatar = self.room.users.get(data.id);
  };


  const self = (() => {
    const editable = new Set(["paused"]);

    const properties = {
      room,
      socket: room.socket,

      get unload () { return unload; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (editable.has(prop)) {
          p.socket.emit("updateLevel", { prop, val });
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
