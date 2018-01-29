"use strict";


const LocalLevel = (room, data) => {
  const initCanvas = () => {
    const initSprites = () => {
      const sprite = new PIXI.Sprite(
        PIXI.loader.resources["images/avatar.png"].texture
      );

      sprites.set("avatar", sprite);
      gfx.stage.addChild(sprites.get("avatar"));
    };


    const imageFiles = [
            "images/avatar.png"
          ],
          pixiOptions = {
            width: 256,
            height: 256
          },
          sprites = new Map();

    const gfx = new PIXI.Application(pixiOptions);
    gfx.renderer.backgroundColor = 0x4444BB;

    PIXI.loader.add(imageFiles).load(initSprites);
    app.els.game.appendChild(gfx.view);
  };






  const listenToServer = () => {
    self.socket.on("updateAvatar", updateAvatar);
  };

  const listenToUser = () => {
    document.addEventListener("keydown", app.user.avatar.startAction);
    document.addEventListener("keyup", app.user.avatar.endAction);
  };

  const load = (data) => {
    Object.assign(self, data.props);
    listenToServer();
    listenToUser();
    app.user.avatar.load();
    app.view = "game";

    ////
    // tiles

    initCanvas();
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
    const avatar = self.room.users.get(data.id).avatar;
    avatar.update(data);
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
