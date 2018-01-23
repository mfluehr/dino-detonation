"use strict";


const App = () => {
  const self = (() => {
    const properties = Object.seal({
      els: {
        views: document.getElementsByClassName("view"),
        lobby: document.getElementById("lobby-view"),
        room: document.getElementById("room-view"),
        game: document.getElementById("game-view")
      },
      lobby: {},
      url: "localhost:4000",
      user: {},
      view: undefined
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
          p.els.views[0].classList.remove("hidden"); ////
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
app.lobby = Lobby();
app.user = PersonalUser(app.lobby);
