"use strict";


const LocalLevel = (room, data) => {
  const initCanvas = () => {
    const initSprites = () => {
      initAvatarSprites();
      gfx.ticker.add(delta => gameLoop(delta));
    };

    const initText = () => {
      const style = new PIXI.TextStyle({
        fill: "yellow",
        fontSize: 16
      });

      msg = new PIXI.Text("...", style);
      msg.position.set(5, 5);
      gfx.stage.addChild(msg);
    };


    const imageFiles = [
            { name: "avatar", url: "images/avatar.png" }
          ],
          pixiOptions = {
            width: 600,
            height: 600
          };

    gfx = new PIXI.Application(pixiOptions);
    gfx.renderer.backgroundColor = 0x5555BB;

    initText();

    PIXI.loader.add(imageFiles)
        //// .on("progress", spriteProgress)
        .load(initSprites);
    app.els.game.appendChild(gfx.view);
  };

  const draw = () => {
    const z = self.room.users.get(app.user.id).avatar;

    msg.text = `${Math.round(z.x)},${Math.round(z.y)} @ ${z.speed}`;

    room.users.forEach((user) => {
      const avatar = user.avatar;
      self.sprites.get(user.id).position.set(avatar.x, avatar.y);
    });
  };

  const gameLoop = (delta) => {
    interpolate(delta);
    draw();
  };

  const initAvatarSprites = () => {
    room.users.forEach((user) => {
      const texture = PIXI.loader.resources.avatar.texture;
      const sprite = new PIXI.Sprite(texture);
      self.sprites.set(user.id, sprite);
      gfx.stage.addChild(self.sprites.get(user.id));
    });
  };

  const interpolate = (delta) => {
    const ms = delta / 60 * 1000;

    room.users.forEach((user) => {
      user.avatar.tick(ms);
    });
  };







  const listenToServer = () => {
    ////
  };

  const listenToUser = () => {
    document.addEventListener("keydown", app.user.avatar.startAction);
    document.addEventListener("keyup", app.user.avatar.endAction);
  };

  const load = (data) => {
    Object.assign(self, data.props);
    listenToServer();
    listenToUser();

    ////
    // tiles

    initCanvas();
    app.user.avatar.load();
    app.view = "game";
  };

  const unlistenToServer = () => {
    ////
  };

  const unlistenToUser = () => {
    document.removeEventListener("keydown", app.user.avatar.startAction);
    document.removeEventListener("keyup", app.user.avatar.endAction);
  };

  const unload = () => {
    gfx.ticker.destroy();
    unlistenToServer();
    unlistenToUser();
    app.view = "room";
  };


  let gfx,
      msg;


  const self = (() => {
    const editable = new Set(["paused"]);

    const properties = {
      room,
      socket: room.socket,
      sprites: new Map(),

      get unload () { return unload; }
    };

    const p = new Proxy(properties, {
      set: (obj, prop, val) => {
        if (editable.has(prop)) {
          p.socket.emit("syncLevel", { prop, val });
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
