import { Context, Effect, Ref } from "effect";
import { ObstacleError } from "~/error";
import { Config } from "~/layers/config";
import { Command, Direction, Position, Rover } from "~/types";

export class CommandService extends Context.Tag("@app/CommandService")<
  CommandService,
  {
    runCommands: (
      roverRef: Ref.Ref<Rover>,
      commands: Command[],
    ) => Effect.Effect<void, ObstacleError, Config>;
  }
>() {}

export type CommandServiceAPI = Context.Tag.Service<CommandService>;

export const CommandServiceDefaultImpl = {
  runCommands(roverRef: Ref.Ref<Rover>, commands: Command[]) {
    return Effect.gen(function* (_) {
      let currentRover = yield* _(roverRef.get);

      for (const c of commands) {
        currentRover = yield* _(runCommand(currentRover, c));
        yield* _(Ref.set(roverRef, currentRover));
      }
    });
  },
};

function runCommand(
  rover: Rover,
  command: Command,
): Effect.Effect<Rover, ObstacleError, Config> {
  return Effect.gen(function* (_) {
    const { logMoves } = yield* _(Config);

    let nextRover = { ...rover, position: { ...rover.position } };

    switch (command) {
      case "b":
      case "f": {
        nextRover.position = yield* _(
          move(rover.position, rover.direction, command === "b"),
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
        nextRover.direction = yield* _(
          rotate(rover.direction, command === "r"),
        );

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

    const collision = yield* _(detectCollision(nextRover));

    if (collision) {
      return yield* _(
        Effect.fail(new ObstacleError("Hit something!", nextRover.position)),
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
  return Effect.gen(function* (_) {
    const { planet } = yield* _(Config);
    const movement = reverse ? -1 : 1;
    let nextPosition = { ...position };

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
  return Effect.gen(function* (_) {
    const { planet } = yield* _(Config);

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
