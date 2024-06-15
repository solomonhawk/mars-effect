import { Command as Cmd, Options, ValidationError } from "@effect/cli";
import { p } from "@effect/cli/HelpDoc";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Effect } from "effect";
import { makeObstacles } from "~/helpers";
import { Config } from "~/layers/config";
import { Position } from "~/position";
import { CommandService, CommandServiceDefaultImpl } from "~/services/command";
import { program } from "./program";

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
    playbackSpeed: Options.float("playbackSpeed").pipe(
      Options.withAlias("s"),
      Options.withDefault(500),
    ),
  },
  (opts) => {
    const initialPosition = new Position(opts.initialX, opts.initialY);

    if (
      opts.initialX < 0 ||
      opts.initialY < 0 ||
      opts.initialX >= opts.width ||
      opts.initialY >= opts.height
    ) {
      throw ValidationError.invalidArgument(
        p("Initial position is out of bounds"),
      );
    }

    return program.pipe(
      Effect.provideService(CommandService, CommandServiceDefaultImpl),
      Effect.provideService(Config, {
        playbackSpeed: opts.playbackSpeed,
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
    );
  },
);

const cli = Cmd.run(command, {
  name: "Mars Rover CLI",
  version: "v1.0.0",
});

process.stdin.on("keypress", () => {});

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);
