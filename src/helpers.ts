import { Effect, Ref } from "effect";
import { Direction, Rover } from "./types";
import { Config } from "./layers/config";
import { Position } from "./position";
import { Terminal } from "./terminal";

export function makeObstacles(
  width: number,
  height: number,
  density: number,
  disallowedPositions: Position[],
): Position[] {
  const positions = width * height;
  let obstacleCount = Math.round(positions * density);
  let obstacles: Set<Position> = new Set();

  if (obstacleCount === 0) {
    return [];
  }

  while (obstacleCount > 0) {
    const position = new Position(
      Math.floor(Math.random() * width),
      Math.floor(Math.random() * height),
    );

    if (obstacles.has(position)) {
      continue;
    }

    if (disallowedPositions.some((p) => p.equals(position))) {
      continue;
    }

    obstacles.add(position);
    obstacleCount--;
  }

  return Array.from(obstacles);
}

export function printPlanetState(
  roverRef: Ref.Ref<Rover>,
): Effect.Effect<void, never, Config> {
  return Effect.gen(function* (_) {
    const { planet } = yield* _(Config);
    const rover = yield* _(roverRef.get);
    const obstacles = new Array(planet.height)
      .fill(null)
      .map(() => new Array(planet.width).fill(false));

    for (const obstacle of planet.obstacles) {
      obstacles[obstacle.y][obstacle.x] = true;
    }

    let planetView = "\n\n";

    for (let y = 0; y < planet.height; y++) {
      for (let x = 0; x < planet.width; x++) {
        if (rover.position.x === x && rover.position.y === y) {
          planetView += Terminal.highlight(roverIcon(rover.direction));
        } else if (obstacles[y][x]) {
          planetView += Terminal.emphasize("⩍");
        } else {
          planetView += "·";
        }

        planetView += " ";
      }

      planetView += "\n";
    }

    planetView += "\n";

    yield* _(Effect.log(Terminal.clear(planetView)));
  });
}

function roverIcon(direction: Direction): string {
  switch (direction) {
    case "N":
      return "↑";
    case "S":
      return "↓";
    case "E":
      return "→";
    case "W":
      return "←";
  }
}
