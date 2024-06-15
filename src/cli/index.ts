import { Command, Options } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { program } from "./program";
import { makeAppLayersLive } from "~/layers";

const coordinate = Schema.Number.pipe(Schema.positive());
const planetDimension = Schema.Number.pipe(
  Schema.positive(),
  Schema.greaterThan(3),
);

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
    Options.withSchema(coordinate),
  ),
  initialY: Options.integer("initialY").pipe(
    Options.withDescription("Initial rover Y position"),
    Options.withAlias("y"),
    Options.withDefault(4),
    Options.withSchema(coordinate),
  ),
  width: Options.integer("width").pipe(
    Options.withDescription("Planet width"),
    Options.withAlias("w"),
    Options.withDefault(10),
    Options.withSchema(planetDimension),
  ),
  height: Options.integer("height").pipe(
    Options.withDescription("Planet height"),
    Options.withAlias("h"),
    Options.withDefault(10),
    Options.withSchema(planetDimension),
  ),
  obstacleDensity: Options.float("obstacleDensity").pipe(
    Options.withDescription("Obstacle density decimal percentage (0 - 1)"),
    Options.withAlias("o"),
    Options.withDefault(0.2),
    Options.withSchema(Schema.Number.pipe(Schema.clamp(0, 1))),
  ),
  playbackSpeed: Options.float("playbackSpeed").pipe(
    Options.withDescription("Playback speed in milliseconds"),
    Options.withAlias("s"),
    Options.withDefault(250),
    Options.withSchema(Schema.Number.pipe(Schema.nonNegative())),
  ),
};

export type AppLayersOpts = Command.Command.ParseConfig<typeof options>;

const Opts = Schema.Struct({
  initialX: coordinate,
  initialY: coordinate,
  width: planetDimension,
  height: planetDimension,
}).pipe(
  Schema.filter((opts) => {
    if (opts.initialX >= opts.width) {
      return "X position is out of bounds";
    }

    if (opts.initialY >= opts.height) {
      return "Y position is out of bounds";
    }
  }),
);

const command = Command.make("mars-rover", options, (opts) => {
  Schema.decodeSync(Opts)(opts);
  return program.pipe(Effect.provide(makeAppLayersLive(opts)));
});

const cli = Command.run(command, {
  name: "Mars Rover CLI",
  version: "v1.0.0",
});

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);
