import { Effect } from "effect";
import { Config } from "./layers/config";
import { type State } from "./layers/state";
import { Position } from "./position";
import { Terminal } from "./terminal";
import { type Direction, type Rover } from "./types";

export function makeObstacles(
  width: number,
  height: number,
  density: number,
  disallowedPositions: Position[],
): Position[] {
  const positions = width * height;
  let obstacleCount = Math.round(positions * density);

  if (obstacleCount === 0) {
    return [];
  }

  const candidates: Array<Position> = [];
  const obstacles: Array<Position> = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const position = new Position(x, y);

      if (disallowedPositions.some((p) => p.equals(position))) {
        continue;
      }

      candidates.push(position);
    }
  }

  shuffle(candidates);

  while (obstacleCount > 0) {
    const position = candidates.pop();

    if (!position) {
      break;
    }

    obstacles.push(position);
    obstacleCount--;
  }

  return obstacles;
}

export function printPlanetState(
  rover: Rover,
  obstacleCollision?: Position,
): Effect.Effect<void, never, Config | State> {
  return Effect.gen(function* () {
    const { planet } = yield* Config;
    const obstacles = new Array(planet.height)
      .fill(null)
      .map(() => new Array(planet.width).fill(false));

    for (const obstacle of planet.obstacles) {
      obstacles[obstacle.y][obstacle.x] = true;
    }

    let planetView = "";

    for (let y = 0; y < planet.height; y++) {
      for (let x = 0; x < planet.width; x++) {
        const position = new Position(x, y);

        if (rover.position.equals(position)) {
          planetView += Terminal.highlight(roverIcon(rover.direction));
        } else if (obstacles[y][x]) {
          if (obstacleCollision?.equals(position)) {
            planetView += Terminal.collision("⩍");
          } else {
            planetView += Terminal.emphasize("⩍");
          }
        } else {
          planetView += "·";
        }

        planetView += " ";
      }

      planetView += "\n";
    }

    planetView += "\n";

    yield* Effect.log(Terminal.clear(planetView));
  });
}

function shuffle<T>(array: T[]) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
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
