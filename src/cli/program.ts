import { Prompt } from "@effect/cli";
import { Effect, Ref } from "effect";
import { printPlanetState } from "~/helpers";
import { Command, isCmd } from "~/layers/command";
import { Config } from "~/layers/config";
import { State } from "~/layers/state";
import { type Cmd } from "~/types";

export const program = Effect.gen(function* () {
  let quit = false;

  const config = yield* Config;
  const { runCommands } = yield* Command;
  const { rover } = yield* State;

  yield* printPlanetState(yield* rover.get);

  while (true) {
    const cmds = (yield* Prompt.list({
      message: "Enter commands (or ? for help)",
      delimiter: ",",
      validate: (value) => {
        if (value === "q") {
          quit = true;
          return Effect.succeed("");
        }

        const commands = value.split(",");

        if (commands.every(isCmd)) {
          return Effect.succeed(value);
        } else {
          return Effect.fail("Valid commands are f, b, l, r, or q to quit");
        }
      },
    })) as Cmd[];

    if (quit) {
      return;
    }

    yield* runCommands(cmds, (rover, isLast) => {
      return Effect.gen(function* () {
        yield* printPlanetState(rover);

        if (!isLast) {
          yield* Effect.sleep(config.playbackSpeed);
        }
      });
    }).pipe(
      Effect.matchEffect({
        onSuccess: () => {
          return Ref.get(rover).pipe(
            Effect.tap((rover) => {
              return Effect.all([
                printPlanetState(rover),
                Effect.log(
                  `Rover is now at x=${rover.position.x}, y=${rover.position.y}, facing ${rover.direction}`,
                ),
              ]);
            }),
          );
        },
        onFailure: (error) => {
          return Ref.get(rover).pipe(
            Effect.tap((rover) => {
              return Effect.all([
                printPlanetState(rover, error.position),
                Effect.log(error.print()),
              ]);
            }),
          );
        },
      }),
    );
  }
});
