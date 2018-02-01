"use strict";


const App = () => {
  const load = () => {
    self.socket = io.connect(self.url);
    self.lobby = Lobby();
    self.user = PersonalUser(self.lobby);
  };


  const self = (() => {
    const properties = Object.seal({
      els: {
        views: document.getElementsByClassName("view"),
        lobby: document.getElementById("lobby-view"),
        room: document.getElementById("room-view"),
        game: document.getElementById("game-view")
      },
      lobby: undefined,
      socket: undefined,
      url: "localhost:4000",
      user: undefined,
      view: undefined,

      get load () { return load; }
    });

    const p = new Proxy(properties, {
      get: (obj, prop) => {
        return obj[prop];
      },
      set: (obj, prop, val) => {
        obj[prop] = val;

        if (prop === "view") {
          for (let i = 0; i < p.els.views.length; i ++) {
            p.els.views[i].classList.add("hidden");
          }
          p.els[val].classList.remove("hidden");
        }

        return true;
      }
    });

    return p;
  })();


  return self;
};


const app = App();
app.load();
