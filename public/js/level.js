"use strict";


const LocalLevel = (room, data) => {
  const listenToServer = () => {
    //// self.socket.on("loadLocalLevel", load);
  };

  const listenToUser = () => {
    document.addEventListener("keydown", app.user.avatar.startAction);
    document.addEventListener("keyup", app.user.avatar.endAction);
  };

  const load = (data) => {
    listenToServer();
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

      get unload () { return unload; }
    };

    const p = properties;

    return p;
  })();


  load(data);


  return self;
};
