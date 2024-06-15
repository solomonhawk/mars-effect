import { Command, HelpDoc, Options, ValidationError } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Effect } from "effect";
import { program } from "./program";
import { makeAppLayersLive } from "~/layers";

const options = {
  initialDirection: Options.choice("initialDir", ["N", "S", "E", "W"]).pipe(
    Options.withDescription("Initial rover direction"),
    Options.withAlias("d"),
    Options.withDefault("N"),
  ),
  initialX: Options.integer("initialX").pipe(
    Options.withDescription("Initial rover X position"),
    Options.withAlias("x"),
    Options.withDefault(4),
  ),
  initialY: Options.integer("initialY").pipe(
    Options.withDescription("Initial rover Y position"),
    Options.withAlias("y"),
    Options.withDefault(4),
  ),
  width: Options.integer("width").pipe(
    Options.withDescription("Planet width"),
    Options.withAlias("w"),
    Options.withDefault(10),
  ),
  height: Options.integer("height").pipe(
    Options.withDescription("Planet height"),
    Options.withAlias("h"),
    Options.withDefault(10),
  ),
  obstacleDensity: Options.float("obstacleDensity").pipe(
    Options.withDescription("Obstacle density decimal percentage (0 - 1)"),
    Options.withAlias("o"),
    Options.withDefault(0.2),
  ),
  playbackSpeed: Options.float("playbackSpeed").pipe(
    Options.withDescription("Playback speed in milliseconds"),
    Options.withAlias("s"),
    Options.withDefault(250),
  ),
};

export type AppLayersOpts = Command.Command.ParseConfig<typeof options>;

const command = Command.make("mars-rover", options, (opts) => {
  if (
    opts.initialX < 0 ||
    opts.initialY < 0 ||
    opts.initialX >= opts.width ||
    opts.initialY >= opts.height
  ) {
    throw ValidationError.invalidArgument(
      HelpDoc.p("Initial position is out of bounds"),
    );
  }

  return program.pipe(Effect.provide(makeAppLayersLive(opts)));
});

const cli = Command.run(command, {
  name: "Mars Rover CLI",
  version: "v1.0.0",
});

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);
