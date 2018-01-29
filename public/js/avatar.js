"use strict";


const LocalAvatar = (user) => {
  const update = (data) => {
    ////
    console.log(data.props);

    Object.assign(self, data.props);
  };


  const self = (() => {
    const properties = {
      socket: app.lobby.socket,
      user,

      get update () { return update; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        obj[prop] = val;
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
          self.speed = 0;
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
          console.log("up");
          self.rad = Math.PI * 3/2;
          self.speed = 100;
          break;
        case "moveRight":
          console.log("right");
          self.rad = 0;
          self.speed = 100;
          break;
        case "moveDown":
          console.log("down");
          self.rad = Math.PI * 1/2;
          self.speed = 100;
          break;
        case "moveLeft":
          console.log("left");
          self.rad = Math.PI;
          self.speed = 100;
          break;
        case "pauseGame":
          self.level.paused = !self.level.paused;
          break;
      }
    }
  };


  const self = (() => {
    const editable = new Set(["rad", "speed"]);

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
