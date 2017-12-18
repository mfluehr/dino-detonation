"use strict";


const UserBase = (properties, lobbyIo) => {
  properties.lobbyIo = lobbyIo;
  return properties;
};

const User = (properties, lobbyIo) => {
  const base = UserBase(properties, lobbyIo),
        displayed = new Set(["name"]);

  const els = {
    userList: document.getElementById("lobby-view-users")
  };

  const p = new Proxy(base, {
    get: (obj, prop) => {
      if (prop === "base") return base;
      return obj[prop];
    },
    set: (obj, prop, val) => {
      obj[prop] = val;

      if (displayed.has(prop)) {
        const el =  els.userList.querySelector(`[data-id="${p.id}"] .${prop}`);
        el.innerText = val;
      }

      return true;
    }
  });

  return p;
};

const LocalUser = (base) => {
  const editable = new Set(["email", "name"]);

  const p = new Proxy(base, {
    get: (obj, prop) => {
      return obj[prop];
    },
    set: (obj, prop, val) => {
      if (editable.has(prop)) {
        base.lobbyIo.emit("updateUser", { prop, val });
        return true;
      }

      return false;
    }
  });

  return p;
};
