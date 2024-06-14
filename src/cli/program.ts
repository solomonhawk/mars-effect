import { Prompt } from "@effect/cli";
import { Effect, Ref } from "effect";
import { printPlanetState } from "~/helpers";
import { Config } from "~/layers/config";
import { CommandService, isCommand } from "~/services/command";
import { Rover, Command } from "~/types";

export const program = Effect.gen(function* () {
  let quit = false;

  const config = yield* Config;
  const commandService = yield* CommandService;

  const roverRef = yield* Ref.make<Rover>({
    direction: config.initialDirection,
    position: config.initialPosition,
  });

  yield* printPlanetState(yield* roverRef.get);

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

        if (commands.every(isCommand)) {
          return Effect.succeed(value);
        } else {
          return Effect.fail("Valid commands are f, b, l, r, or q to quit");
        }
      },
    })) as Command[];

    if (quit) {
      return;
    }

    yield* commandService
      .runCommands(roverRef, cmds, (rover, isLast) => {
        return Effect.gen(function* () {
          yield* printPlanetState(rover);

          if (!isLast) {
            yield* Effect.sleep(config.playbackSpeed);
          }
        });
      })
      .pipe(
        Effect.matchEffect({
          onSuccess: () => {
            return Ref.get(roverRef).pipe(
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
            return Ref.get(roverRef).pipe(
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
