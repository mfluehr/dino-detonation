"use strict";


const App = () => {
  const properties = {
    els: {
      views: document.getElementsByClassName("view"),
      lobby: document.getElementById("lobby-view"),
      room: document.getElementById("room-view"),
      game: document.getElementById("game-view")
    },
    url: "localhost:4000",
    view: undefined
  };

  const p = new Proxy(properties, {
    get: (obj, prop) => {
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;

      if (prop === "view") {
        for (let i = 0; i < p.els.views.length; i ++) {
          p.els.views[i].classList.remove("visible");
        }
        p.els[val].classList.add("visible");
      }

      return true;
    }
  });

  return p;
};


const app = App(),
      lobby = Lobby();
