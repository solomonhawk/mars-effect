import { Prompt } from "@effect/cli";
import { Effect, Ref } from "effect";
import { printPlanetState } from "~/helpers";
import { Config } from "~/layers/config";
import { CommandService, isCommand } from "~/services/command";
import { Rover, Command } from "~/types";

export const program = Effect.gen(function* (_) {
  let quit = false;

  const config = yield* _(Config);
  const commandService = yield* _(CommandService);

  const roverRef = yield* _(
    Ref.make<Rover>({
      direction: config.initialDirection,
      position: config.initialPosition,
    }),
  );

  yield* _(printPlanetState(yield* _(roverRef.get)));

  while (true) {
    const cmds = (yield* _(
      Prompt.list({
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
      }),
    )) as Command[];

    if (quit) {
      return;
    }

    yield* _(
      commandService
        .runCommands(roverRef, cmds, (rover) => {
          return Effect.gen(function* (_) {
            yield* _(printPlanetState(rover));
            yield* _(Effect.sleep(config.playbackSpeed));
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
        ),
    );
  }
});
