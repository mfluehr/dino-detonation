"use strict";


const PersonalAvatar = (app, user) => {
  const endAction = (e) => {
    const a = self.input.get(e.key);

    if (a && self.actions.has(a)) {
      self.actions.delete(a);

      switch (a) {
        case "moveUp":
        case "moveRight":
        case "moveDown":
        case "moveLeft":
          if (!self.actions.has("moveUp") &&
              !self.actions.has("moveRight") &&
              !self.actions.has("moveDown") &&
              !self.actions.has("moveLeft")) {
            self.speed = 0;
          }
          break;
      }
    }
  };

  const load = () => {
    self.local = user.room.users.get(user.id).avatar;
  };

  const startAction = (e) => {
    const a = self.input.get(e.key);

    if (a && !self.actions.has(a)) {
      self.actions.add(a);

      switch (a) {
        case "dropBomb":
          app.socket.emit(a);
          break;
        case "moveUp":
          self.rad = Math.PI * 3/2;
          self.speed = self.local.speedLimit;
          break;
        case "moveRight":
          self.rad = 0;
          self.speed = self.local.speedLimit;
          break;
        case "moveDown":
          self.rad = Math.PI * 1/2;
          self.speed = self.local.speedLimit;
          break;
        case "moveLeft":
          self.rad = Math.PI;
          self.speed = self.local.speedLimit;
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
      actions: new Set(),
      input: new Map([
        [" ", "dropBomb"],
        ["ArrowUp", "moveUp"],
        ["ArrowRight", "moveRight"],
        ["ArrowDown", "moveDown"],
        ["ArrowLeft", "moveLeft"],
        ["p", "pauseGame"]
      ]),
      user,

      get endAction () { return endAction; },
      get load () { return load; },
      get startAction () { return startAction; },

      get level () { return self.user.room.level; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (editable.has(prop)) {
          app.socket.emit("syncAvatar", { prop, val });
          self.local[prop] = val;
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


module.exports = PersonalAvatar;
