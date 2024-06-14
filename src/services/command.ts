import { Context, Effect, Ref } from "effect";
import { ObstacleError } from "~/error";
import { Config } from "~/layers/config";
import { Command, Rover } from "~/types";

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
    // const { planet } = yield* _(Config);

    // if (Math.random() > 0.5) {
    //   yield* Effect.fail(new ObstacleError("Fake error"));
    // }

    switch (command) {
      case "f": {
        const nextRover = {
          ...rover,
          position: { ...rover.position, y: rover.position.y + 1 },
        } satisfies Rover;

        yield* Effect.log(
          `moving forward ${rover.direction} => ${JSON.stringify(nextRover, null, 2)}`,
        );

        return yield* Effect.succeed(nextRover);
      }

      default:
        return yield* Effect.succeed(rover);
    }
  });
}
