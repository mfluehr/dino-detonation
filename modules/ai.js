"use strict";


// Pathfinding

const Path = () => {
  let dist = Infinity,
      route;

  return {
    dist,
    route
  };
};

const findPath = (a, b, avoid = [
  solid = Infinity,
  pit = Infinity
]) => {
  // ... A* pathfinder

  const path = Path();

  while (searching) {
    if (travelTime > threatTime) {
      allow(tile);
    }
  }

  return path;
};

const safePath = (avatar, a, b) => {
  // ... A* pathfinder

  return findPath(a, b, avatar.threatTimeMap);
};



// Seek bonuses

const findGoodBonus = (avatar) => {
  let bestPath = Path(),
      bestValue = Infinity;

  for (let bonus of bonuses) {
    if (needsBonus(avatar, bonus) &&
        bonus.value >= bestValue) {
      let path = safePath(avatar, bonus);

      if (path.dist < bestPath.dist &&
          !closerEnemyWantsBonus(avatar, bonus, path)) {
        bestPath = path;
        bestValue = bonus.value;
      }
    }
  }

  if (bestPath.dist < Infinity) {
    return bestPath;
  }

  return false;
};

const needsBonus = (avatar, bonus) => {
  ////
};

const closerAvatarWantsBonus = (avatar, otherPath, bonus) => {
  let closestAvatar,
      closestPath = Infinity;

  for (let n of avatars) {
    if (!n.hasBonus(bonus)) {
      let enemyPath = safePath(n, bonus);

      if (enemyPath < closestPath) {
        closestAvatar = n;
        closestPath = enemyPath;
      }
    }
  }

  return closestPath < otherPath;
};


// Seek enemies

const findGoodEnemy = (avatar) => {
  let bestPath = Path(),
      bestEnemy;

  return bestEnemy;
};


// Seek mines

const findGoodMine = (avatar) => {
  let bestPath = Path(),
      bestMine;

  mines = tiles.reduce(tile.type === mine);

  bestMine = mines.reduce((mines, best) => {
    let path = safePath(avatar.pos, tile.pos);

    return path < bestPath ? path : bestPath;
  })

  return bestMine;
};



// Strategizing

const mapThreatTimes = (avatar) => {
  let threatMap = [[]];

  for (let tile of tiles) {
    tile.timer = 0;

    if (tile.type === explosion) {
      for (let tile of tilesInReach) {
        tile.timer = explosion.timer;
      }
    }
    else if (tile.type === bomb) {
      if (isDynamite(bomb)) {
        if (bomb.owner != avatar || avatar.friend) {
          for (let tile of tilesInReach) {
            tile.timer = Infinity;
          }
        }
      }
      else {
        let timer = bomb.timer + settings.explosions.timer;

        for (let tile of tilesInReach) {
          if (timer > tile.timer) {
            tile.timer = timer;
          }
        }
      }
    }
  }

  return threatMap;
};

const mapDynamite = (avatar) => {
  let dynamiteMap = util.Array2(level.width, level.height),
      friends = 0,
      enemies = 0;

  for (let bomb of avatar.bombs) {
    let x1 = Math.max(0, bomb.pos.x - bomb.range),
        x2 = Math.min(level.width, bomb.pos.x + bomb.range),
        y1 = Math.max(0, bomb.pos.y - bomb.range),
        y2 = Math.min(level.height, bomb.pos.y + bomb.range);

    dynamiteMap[bomb.pos.x][bomb.pos.y] = 1;

    for (let x = bomb.pos.x - 1, y = bomb.pos.y; x >= x1; x --) {
      // 1 = yes, 0 = no, -1 = passthrough
      dynamiteMap[x][y] = tile[x][y].type.destructable;
      dynamiteMap[x][y] === -1 ? continue : break;
    }

    // ...
  }

  for (let  of avatars) {
    if (dynamiteMap(n.pos)) {
      if (n.team === avatar.team) {
        friends ++;
      }
      else {
        enemies ++;
      }
    }
  }

  return {
    dynamiteMap,
    friends,
    enemies
  };
};

const Ai = (avatar) => {
  let dynamiteMap = mapDynamite(avatar),
      attackMap = mapAttack(avatar)
      threatTimeMap = mapThreatTimes(avatar);

  remap = () => {
    //// TODO
  };

  const think = () => {
    // Use bombs
    if (dynamiteMap.enemies >= dynamiteMap.friends) {
      avatar.detonateBombs();
    }
    else if (dynamiteMap.friends === 0 &&
        dynamiteMap.mines > 0) {
      avatar.detonateBombs();
    }
    else if (attackMap.enemies) {
      avatar.dropBomb();
    }
    else if (attackRange.mines) {
      avatar.dropBomb();
    }

    // Move
    if (findGoodBonus(avatar)) {
      seek(bonus);
    }
    else if (avatar.bombs > 0 &&
        findGoodEnemy(avatar)) {
      seek(enemy);
    }
    else if (findGoodMine(avatar)) {
      seek(mine);
    }
    else if (findHaven(avatar)) {
      seek(haven);
    }
    else {
      enemy = findNearestEnemy(avatar)
      seek(enemy);
    }
  }

  return {
    think,
    dynamiteMap,
    attackMap,
    threatTimeMap
  };
};
