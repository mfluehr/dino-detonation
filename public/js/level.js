"use strict";


const LocalLevel = (room) => {
  const listenToUser = () => {
  };

  const listenToServer = () => {
    self.socket.on("loadLocalLevel", (data) => load(data));
  };

  const load = (data) => {
    app.view = "game";
    listenToUser();
  };


  const self = (() => {
    const properties = {
      socket: room.socket,

      get load () { return load; }
    };

    const p = new Proxy(properties, {
      ////
    });

    return p;
  })();


  listenToServer();


  return self;
};
