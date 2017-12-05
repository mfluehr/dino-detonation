// Dino Detonation AI ideas


const extendFrom(pos, dist) {
  //
}



// Pathfinding algorithms

const Path = () => {
  // A* pathfinder

  return {
    dist: Infinity
  }
}

const safePath = (a, b) => {
  // A* pathfinder
  // Considers: threatTimeMap

  return {dist, route}
}



// Seek bonuses

const findGoodBonus = (avatar) => {
  let bestPath = Path(),
      bestValue = Infinity

  for (bonus of bonuses) {
    if (needsBonus(avatar, bonus) &&
        bonus.value >= bestValue) {
      let path = safePath(avatar, bonus)

      if (path.dist < bestPath.dist &&
          !closerEnemyWantsBonus(avatar, bonus, path)) {
        bestPath = path
        bestValue = bonus.value
      }
    }
  }

  if (bestPath.dist < Infinity) {
    return bestPath
  }

  return false
}

const needsBonus = (avatar, bonus) => {
  //
}

const closerAvatarWantsBonus = (avatar, otherPath, bonus) => {
  let closestAvatar,
      closestPath = Infinity

  for (n of avatars) {
    if (!n.hasBonus(bonus)) {
      let enemyPath = safePath(n, bonus)

      if (enemyPath < closestPath) {
        closestAvatar = n
        closestPath = enemyPath
      }
    }
  }

  return closestPath < otherPath
}


// Seek enemies

const findGoodEnemy = (avatar) => {
  let bestPath = Path(),
      bestEnemy

  return bestEnemy
}


// Seek mines

const findGoodMine = (avatar) => {
  let bestPath = Path(),
      bestMine

  mines = tiles.reduce(tile.type == mine)

  bestMine = mines.reduce((mines, best) => {
    let path = safePath(avatar.pos, tile.pos)

    return path < bestPath ? path : bestPath
  })

  return bestMine
}



// Strategizing

const mapThreatTimes = (avatar) => {
  let threatMap = [[]]

  for (tile of tiles) {
    tile.timer = 0

    if (tile.type == explosion) {
      for (tile of tilesInReach) {
        tile.timer = explosion.timer
      }
    }
    else if (tile.type == bomb) {
      if (isDynamite(bomb)) {
        if (bomb.owner != avatar || avatar.friend) {
          for (tile of tilesInReach) {
            tile.timer = Infinity
          }
        }
      }
      else {
        let timer = bomb.timer + settings.explosions.timer

        for (tile of tilesInReach) {
          if (timer > tile.timer) {
            tile.timer = timer
          }
        }
      }
    }
  }

  return threatMap
}

const mapDynamite = (avatar) => {
  let dynamiteMap = new Array(level.height),
      friends = 0,
      enemies = 0

  const row = new Array(level.width).fill(0)
  dynamiteMap.fill(row)

  for (bomb of avatar.bombs) {
    let x1 = Math.max(0, bomb.pos.x - bomb.range),
        x2 = Math.min(level.width, bomb.pos.x + bomb.range),
        y1 = Math.max(0, bomb.pos.y - bomb.range),
        y2 = Math.min(level.height, bomb.pos.y + bomb.range)

    dynamiteMap[bomb.pos.x][bomb.pos.y] = 1

    for (let x = bomb.pos.x - 1, y = bomb.pos.y; x >= x1; x --) {
      // 1 = yes, 0 = no, -1 = passthrough
      dynamiteMap[x][y] = tile[x][y].type.destructable
      dynamiteMap[x][y] == -1 ? continue : break
    }

    // ...
  }

  for (n of avatars) {
    if (dynamiteMap(n.pos)) {
      if (n.team == avatar.team) {
        friends ++
      }
      else {
        enemies ++
      }
    }
  }

  return {
    dynamiteMap,
    friends,
    enemies
  }
}

const Ai = (avatar) => {
  let dynamiteMap = mapDynamite(avatar),
      attackMap = mapAttack(avatar)
      threatTimeMap = mapThreatTimes(avatar)

  remap = () => {
    //// TODO
  }

  const think = () => {
    // Use bombs
    if (dynamiteMap.enemies >= dynamiteMap.friends) {
      avatar.detonateBombs()
    }
    else if (dynamiteMap.friends == 0 &&
        dynamiteMap.mines > 0) {
      avatar.detonateBombs()
    }
    else if (attackMap.enemies) {
      avatar.dropBomb()
    }
    else if (attackRange.mines) {
      avatar.dropBomb()
    }

    // Move
    if (findGoodBonus(avatar)) {
      seek(bonus)
    }
    else if (avatar.bombs > 0 &&
        findGoodEnemy(avatar)) {
      seek(enemy)
    }
    else if (findGoodMine(avatar)) {
      seek(mine)
    }
    else if (findHaven(avatar)) {
      seek(haven)
    }
    else {
      enemy = findNearestEnemy(avatar)
      seek(enemy)
    }
  }

  return {
    think
  }
}


