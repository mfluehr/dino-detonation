"use strict";


const LocalAvatar = (user) => {
  const self = (() => {
    const properties = {
      user
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        //// self.user.room.level.updateAvatar(self, prop);
        return true;
      }
    });

    return p;
  })();

  return self;
};


const PersonalAvatar = (user) => {
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

  const listen = () => {
    document.addEventListener("keydown", (e) => {
      const action = self.actions[e.key];

      if (action && !action[1]) {
        startAction(action);
      }
    });

    document.addEventListener("keyup", (e) => {
      const action = self.actions[e.key];

      if (action) {
        endAction(action);
      }
    });
  };

  const startAction = (action) => {
    console.log("start:", action[0]);

    action[1] = true;

    switch (action[0]) {
      case "dropBomb":
        self.socket.emit("dropBomb");
        break;
      case "moveUp":
        // self.socket.emit("move", 270);
        self.rad = Math.PI * 3/2;
        break;
      case "moveRight":
        self.rad = 0;
        break;
      case "moveBottom":
        self.rad = Math.PI * 1/2;
        break;
      case "moveLeft":
        self.rad = Math.PI;
        break;
    }
  };


  const self = (() => {
    const properties = {
      actions: {
        " ": ["dropBomb", false],
        "ArrowUp": ["moveUp", false],
        "ArrowRight": ["moveRight", false],
        "ArrowDown": ["moveDown", false],
        "ArrowLeft": ["moveLeft", false]
      },
      socket: user.socket
    };

    const p = properties;

    return p;
  })();


  listen();


  return self;
};
