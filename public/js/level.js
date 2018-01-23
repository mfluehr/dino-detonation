"use strict";


const LocalLevel = (room) => {
  const listenToServer = () => {
    self.socket.on("loadLocalLevel", (data) => load(data));
  };

  const listenToUser = () => {
    document.addEventListener("keydown", (e) => app.user.avatar.startAction(e));
    document.addEventListener("keyup", (e) => app.user.avatar.endAction(e));
  };

  const load = (data) => {
    listenToUser();
    app.user.avatar.load();
    app.view = "game";
  };

  const unload = () => {
    //// unlisten to server
    // unlisten to user
    app.view = "room";
  };


  const self = (() => {
    const properties = {
      socket: room.socket,

      get load () { return load; },
      get unload () { return unload; }
    };

    const p = properties;

    return p;
  })();


  listenToServer();


  return self;
};
