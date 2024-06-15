import { Command, HelpDoc, Options, ValidationError } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Effect } from "effect";
import { makeAppLayersLive } from "~/layers";
import { program } from "./program";

const options = {
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
};

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
