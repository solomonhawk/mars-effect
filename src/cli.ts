import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Command as Cmd, Options, Prompt } from "@effect/cli";
import { Effect, Either, Ref } from "effect";
import {
  CommandService,
  CommandServiceDefaultImpl,
  isCommand,
} from "./services/command";
import { Config } from "./layers/config";
import { Command, Rover } from "./types";
import { makeObstacles, printRoverState } from "./helpers";
import { Position } from "./position";

const command = Cmd.make(
  "mars-rover",
  {
    initialDirection: Options.choice("initialDir", ["N", "S", "E", "W"]).pipe(
      Options.withAlias("d"),
      Options.withDefault("N"),
    ),
    initialX: Options.integer("initialX").pipe(
      Options.withAlias("x"),
      Options.withDefault(0),
    ),
    initialY: Options.integer("initialY").pipe(
      Options.withAlias("y"),
      Options.withDefault(0),
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
      const config = yield* _(Config);
      const commandService = yield* _(CommandService);

      const roverRef = yield* _(
        Ref.make<Rover>({
          direction: config.initialDirection,
          position: config.initialPosition,
        }),
      );

      yield* _(printRoverState(roverRef));

      while (true) {
        const cmds = (yield* _(
          Prompt.list({
            message: "Enter commands",
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

        const result = yield* _(
          Effect.either(commandService.runCommands(roverRef, cmds)),
        );

        yield* _(printRoverState(roverRef));

        if (Either.isLeft(result)) {
          yield* _(Effect.logError(result.left.print()));
        }
      }
    }).pipe(
      Effect.provideService(Config, {
        logMoves: false,
        initialDirection: opts.initialDirection,
        initialPosition,
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
