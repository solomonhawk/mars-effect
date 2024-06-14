import { Context, Effect, Ref } from "effect";
import { ObstacleError } from "~/error";
import { Config } from "~/layers/config";
import { Position } from "~/position";
import { Command, Direction, Rover } from "~/types";

export function isCommand(s: string): s is Command {
  return s === "f" || s === "b" || s === "l" || s === "r";
}

export class CommandService extends Context.Tag("@app/CommandService")<
  CommandService,
  {
    runCommands: (
      roverRef: Ref.Ref<Rover>,
      commands: Command[],
      onStep?: (
        rover: Rover,
        isLast: boolean,
      ) => Effect.Effect<void, never, Config>,
    ) => Effect.Effect<void, ObstacleError, Config>;
  }
>() {}

export type CommandServiceAPI = Context.Tag.Service<CommandService>;

export const CommandServiceDefaultImpl = {
  runCommands(roverRef, commands, onStep) {
    return Effect.gen(function* () {
      let i = 0;
      let currentRover = yield* roverRef.get;

      for (const c of commands) {
        currentRover = yield* runCommand(currentRover, c);
        yield* Ref.set(roverRef, currentRover);

        if (onStep) {
          yield* onStep(currentRover, i === commands.length - 1);
        }

        i++;
      }
    });
  },
} satisfies CommandServiceAPI;

function runCommand(
  rover: Rover,
  command: Command,
): Effect.Effect<Rover, ObstacleError, Config> {
  return Effect.gen(function* () {
    const { logMoves } = yield* Config;

    let nextRover = {
      ...rover,
      position: new Position(rover.position.x, rover.position.y),
    };

    switch (command) {
      case "b":
      case "f": {
        nextRover.position = yield* move(
          rover.position,
          rover.direction,
          command === "b",
        );

        if (logMoves) {
          yield* Effect.log(
            `moving ${command} ${rover.direction} => ${JSON.stringify(nextRover, null, 2)}`,
          );
        }

        break;
      }

      case "l":
      case "r": {
        nextRover.direction = yield* rotate(rover.direction, command === "r");

        if (logMoves) {
          yield* Effect.log(
            `turning ${command} from ${rover.direction} => ${JSON.stringify(nextRover, null, 2)}`,
          );
        }

        break;
      }

      default:
        return yield* Effect.succeed(rover);
    }

    const collision = yield* detectCollision(nextRover);

    if (collision) {
      return yield* Effect.fail(
        new ObstacleError("Hit something!", nextRover.position),
      );
    }

    return yield* Effect.succeed(nextRover);
  });
}

function rotate(
  direction: Direction,
  clockwise: boolean,
): Effect.Effect<Direction> {
  switch (direction) {
    case "N":
      return Effect.succeed(clockwise ? "E" : "W");
    case "S":
      return Effect.succeed(clockwise ? "W" : "E");
    case "E":
      return Effect.succeed(clockwise ? "S" : "N");
    case "W":
      return Effect.succeed(clockwise ? "N" : "S");
  }
}

function move(
  position: Position,
  direction: Direction,
  reverse: boolean,
): Effect.Effect<Position, never, Config> {
  return Effect.gen(function* () {
    const { planet } = yield* Config;
    const movement = reverse ? -1 : 1;
    let nextPosition = new Position(position.x, position.y);

    switch (direction) {
      case "N":
        nextPosition.y = wrap(position.y - movement, 0, planet.height);
        break;
      case "S":
        nextPosition.y = wrap(position.y + movement, 0, planet.height);
        break;
      case "E":
        nextPosition.x = wrap(position.x + movement, 0, planet.width);
        break;
      case "W":
        nextPosition.x = wrap(position.x - movement, 0, planet.width);
        break;
    }

    return yield* Effect.succeed(nextPosition);
  });
}

function detectCollision(rover: Rover): Effect.Effect<boolean, never, Config> {
  return Effect.gen(function* () {
    const { planet } = yield* Config;

    return planet.obstacles.some((obstacle) => {
      return rover.position.x === obstacle.x && rover.position.y === obstacle.y;
    });
  });
}

function wrap(n: number, min: number, max: number): number {
  const next = n % max;

  if (next < min) {
    return max + next;
  }

  return next;
}
