import { Command as Cmd, Options, Prompt, ValidationError } from "@effect/cli";
import { p } from "@effect/cli/HelpDoc";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Effect, Ref } from "effect";
import { makeObstacles, printPlanetState } from "./helpers";
import { Config } from "./layers/config";
import { Position } from "./position";
import {
  CommandService,
  CommandServiceDefaultImpl,
  isCommand,
} from "./services/command";
import { Command, Rover } from "./types";

const command = Cmd.make(
  "mars-rover",
  {
    initialDirection: Options.choice("initialDir", ["N", "S", "E", "W"]).pipe(
      Options.withAlias("d"),
      Options.withDefault("N"),
    ),
    initialX: Options.integer("initialX").pipe(
      Options.withAlias("x"),
      Options.withDefault(4),
    ),
    initialY: Options.integer("initialY").pipe(
      Options.withAlias("y"),
      Options.withDefault(4),
    ),
    width: Options.integer("width").pipe(
      Options.withAlias("w"),
      Options.withDefault(10),
    ),
    height: Options.integer("height").pipe(
      Options.withAlias("h"),
      Options.withDefault(10),
    ),
    obstacleDensity: Options.float("obstacleDensity").pipe(
      Options.withAlias("o"),
      Options.withDefault(0.2),
    ),
  },
  (opts) => {
    const initialPosition = new Position(opts.initialX, opts.initialY);

    return Effect.gen(function* (_) {
      let quit = false;

      if (
        opts.initialX < 0 ||
        opts.initialY < 0 ||
        opts.initialX >= opts.width ||
        opts.initialY >= opts.height
      ) {
        yield* _(
          Effect.fail(
            ValidationError.invalidArgument(
              p("Initial position is out of bounds"),
            ),
          ),
        );
      }

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
                return Effect.fail(
                  "Valid commands are f, b, l, r, or q to quit",
                );
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
                yield* _(Effect.sleep(200));
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
    }).pipe(
      Effect.provideService(Config, {
        initialDirection: opts.initialDirection,
        initialPosition,
        logMoves: false,
        planet: {
          width: opts.width,
          height: opts.height,
          obstacles: makeObstacles(
            opts.width,
            opts.height,
            opts.obstacleDensity,
            [initialPosition],
          ),
        },
      }),
      Effect.provideService(CommandService, CommandServiceDefaultImpl),
    );
  },
);

const cli = Cmd.run(command, {
  name: "Mars Rover CLI",
  version: "v1.0.0",
});

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);
