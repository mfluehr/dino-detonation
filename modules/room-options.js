const RoomOptions = () => {
  const levels = {
    name: "testLevel",
    timer: 300
  };

  const avatars = {
    minCapacity: 4,
    maxCapacity: 10,
    minSpeed: .4,
    maxSpeed: 1.2
  };

  const bombs = {
    speed: .8,
    timer: 2
  };

  const pickups = {
    diseases: true,
    timer: 10
  };

  return {
    levels,
    avatars,
    bombs,
    pickups
  };
};

module.exports = RoomOptions;
