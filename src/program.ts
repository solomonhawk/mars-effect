import { Effect } from "effect";
import * as Ref from "effect/Ref";

export const program = Effect.succeed(1);

export type Position = {
  x: number;
  y: number;
};

export type Rover = {
  position: Position;
  direction: "N" | "S" | "E" | "W";
};

export type Command = "f" | "b" | "l" | "r";

export type Planet = {
  width: number;
  height: number;
  obstacles: Position[];
};

class ObstacleError extends Error {
  _tag = "ObstacleError";

  constructor(readonly message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export function runCommands(
  rover: Ref.Ref<Rover>,
  planet: Planet,
  commands: Command[],
): Effect.Effect<Rover, ObstacleError> {
  return Effect.gen(function* (_) {
    let currentRover = yield* rover.get;

    for (const c of commands) {
      currentRover = yield* runCommand(currentRover, planet, c);
      Ref.set(rover, currentRover);
    }

    return yield* rover.get;
  });
}

export function runCommand(
  rover: Rover,
  planet: Planet,
  command: Command,
): Effect.Effect<Rover, ObstacleError> {
  switch (command) {
    case "f":
      return Effect.succeed({
        ...rover,
        position: { ...rover.position, y: rover.position.y + 1 },
      });
    default:
      return Effect.succeed(rover);
  }
}
