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

  const self = new Proxy(properties, {
    get: (obj, prop) => {
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;

      if (prop === "view") {
        for (let i = 0; i < self.els.views.length; i ++) {
          self.els.views[i].classList.remove("visible");
        }
        self.els[val].classList.add("visible");
      }

      return true;
    }
  });

  return self;
};


const app = App(),
      lobby = Lobby();
