const DIRECTIONS = Object.freeze({
  "top": 1,
  "right": 2,
  "bottom": 3,
  "left": 4
});


const Avatar = (socket, user) => {
  const bonuses = new Set();

  let playerNumber = 0,
      x = 0,
      y = 0,
      bombsUsed = 0,
      capacity = 0,
      minCapacity = 0,
      maxCapacity = 0,
      face,
      speed = 0,
      minSpeed = 0,
      maxSpeed = 0;

  const stats = {
    blocksDestroyed: 0,
    bombsDropped: 0,
    deaths: 0,
    distWalked: 0,
    kills: 0,
    pickupsCollected: 0,
    suicides: 0,
    survivalTime: 0
  };


  const reset = (data) => {
    ({minCapacity, maxCapacity, minSpeed, maxSpeed} =
        {...{minCapacity, maxCapacity, minSpeed, maxSpeed}, ...data});

    bombsUsed = 0;
    capacity = minCapacity;
    face = DIRECTIONS.bottom;
    speed = minSpeed;
  };

  const dropBomb = () => {
    if (bombsUsed < capacity) {
      if (user.room.level.addBomb(user.userId, x, y)) {
        bombsUsed ++;
      }
    }
  };

  const explodeAllBombs = () => {
    if (bonuses.dynamite) {
      //
    }
  };

  const halt = () => {};

  const kill = () => {};

  const move = (angle) => {
    ////socket.broadcast("move", angle);
  };

  const quit = () => {};


  socket.on("dropBomb", function () {
    dropBomb();
    ////this.broadcast("dropBomb");
  });

  socket.on("explodeAllBombs", function () {
    explodeAllBombs();
  });

  socket.on("halt", function () {
    halt();
  });

  socket.on("move", function (angle) {
    move(angle);
  });


  return {
    reset,
    quit
  };
};

module.exports = Avatar;
