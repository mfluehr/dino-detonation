"use strict";


const LocalAvatar = (user) => {
  const updateAvatar = (data) => {
    ////
    console.log(data.props);
  };


  const self = (() => {
    const properties = {
      socket: app.lobby.socket,
      user
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;
        //// self.user.room.level.drawAvatarUpdate(self, prop);
        return true;
      }
    });

    return p;
  })();


  return self;
};

const PersonalAvatar = (user) => {
  const endAction = (e) => {
    const action = self.actions.get(e.key);

    if (action && action.on) {
      action.on = false;

      switch (action.e) {
        case "moveUp":
        case "moveRight":
        case "moveDown":
        case "moveLeft":
          self.socket.emit("halt");
          break;
      }
    }
  };

  const load = () => {
    //// listenToUser();
  };

  const startAction = (e) => {
    const action = self.actions.get(e.key);

    if (action && !action.on) {
      action.on = true;

      switch (action.e) {
        case "dropBomb":
          self.socket.emit(action.e);
          break;
        case "moveUp":
          self.rad = Math.PI * 3/2;
          break;
        case "moveRight":
          self.rad = 0;
          break;
        case "moveDown":
          self.rad = Math.PI * 1/2;
          break;
        case "moveLeft":
          self.rad = Math.PI;
          break;
        case "pauseGame":
          self.level.paused = !self.level.paused;
          break;
      }
    }
  };


  const self = (() => {
    const editable = new Set(["rad"]);

    const properties = {
      actions: new Map([
        [" ", {e: "dropBomb", on: false}],
        ["ArrowUp", {e: "moveUp", on: false}],
        ["ArrowRight", {e: "moveRight", on: false}],
        ["ArrowDown", {e: "moveDown", on: false}],
        ["ArrowLeft", {e: "moveLeft", on: false}],
        ["p", {e: "pauseGame", on: false}]
      ]),
      socket: user.socket,
      user,

      get endAction () { return endAction; },
      get load () { return load; },
      get startAction () { return startAction; },

      get level () { return self.user.room.level; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (editable.has(prop)) {
          p.socket.emit("updateAvatar", { prop, val });
          return true;
        }

        obj[prop] = val;
        return true;
      }
    });

    return p;
  })();


  return self;
};
