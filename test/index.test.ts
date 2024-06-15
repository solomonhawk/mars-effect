import { Effect, Exit, Layer } from "effect";
import { isSuccess } from "effect/Exit";
import { Command } from "~/layers/command";
import { Config } from "~/layers/config";
import { State } from "~/layers/state";
import { Position } from "~/position";

describe("without any obstacles", () => {
  const ConfigTest = Layer.succeed(
    Config,
    Config.of({
      playbackSpeed: 200,
      initialPosition: new Position(0, 0),
      initialDirection: "N",
      logMoves: false,
      planet: {
        height: 5,
        width: 5,
        obstacles: [],
      },
    }),
  );

  const ctx = Effect.provide(
    Layer.mergeAll(Command.Live, State.Live).pipe(
      Layer.provideMerge(ConfigTest),
    ),
  );

  it("follows a `f` command", async () => {
    const program = Effect.gen(function* () {
      const { runCommands } = yield* Command;
      const { rover } = yield* State;

      yield* runCommands(["f"]);

      return yield* rover.get;
    });

    const result = await Effect.runPromiseExit(program.pipe(ctx));

    Exit.map(result, (rover) => {
      expect(isSuccess(result)).toBe(true);
      expect(rover.position).toEqual({ x: 0, y: 4 });
    });
  });

  it("follows a `b` command", async () => {
    const program = Effect.gen(function* () {
      const { runCommands } = yield* Command;
      const { rover } = yield* State;

      yield* runCommands(["b"]);

      return yield* rover.get;
    });

    const result = await Effect.runPromiseExit(program.pipe(ctx));

    Exit.map(result, (rover) => {
      expect(isSuccess(result)).toBe(true);
      expect(rover.position).toEqual({ x: 0, y: 1 });
    });
  });

  it("follows a `l` command", async () => {
    const program = Effect.gen(function* () {
      const { runCommands } = yield* Command;
      const { rover } = yield* State;

      yield* runCommands(["l"]);

      return yield* rover.get;
    });

    const result = await Effect.runPromiseExit(program.pipe(ctx));

    Exit.map(result, (rover) => {
      expect(isSuccess(result)).toBe(true);
      expect(rover.direction).toEqual("W");
    });
  });

  it("follows a `r` command", async () => {
    const program = Effect.gen(function* () {
      const { runCommands } = yield* Command;
      const { rover } = yield* State;

      yield* runCommands(["r"]);

      return yield* rover.get;
    });

    const result = await Effect.runPromiseExit(program.pipe(ctx));

    Exit.map(result, (rover) => {
      expect(isSuccess(result)).toBe(true);
      expect(rover.direction).toEqual("E");
    });
  });
});

describe("with obstacles", () => {
  const ConfigTest = Layer.succeed(
    Config,
    Config.of({
      playbackSpeed: 200,
      initialPosition: new Position(0, 0),
      initialDirection: "N",
      logMoves: false,
      planet: {
        height: 5,
        width: 5,
        obstacles: [new Position(2, 2)],
      },
    }),
  );

  const ctx = Effect.provide(
    Layer.mergeAll(Command.Live, State.Live).pipe(
      Layer.provideMerge(ConfigTest),
    ),
  );

  it("follows commands until an obstacle is encountered and ignores the rest", async () => {
    const program = Effect.gen(function* () {
      const { runCommands } = yield* Command;

      yield* runCommands([
        "r", // 0,0 E
        "f", // 1,0 E
        "f", // 2,0 E
        "r", // 2,0 S
        "f", // 2,1 S
        "f", // 2,2 S (x)
        "f", // 2,3 S
        "l", // 2,3 E
        "b", // 1,3 E
      ]).pipe(
        Effect.catchAll((e) => {
          expect(e.message).toBe("Hit something!");
          expect(e.position).toEqual({ x: 2, y: 2 });

          return Effect.void;
        }),
      );

      const { rover } = yield* State;
      const roverState = yield* rover.get;

      expect(roverState.position).toEqual({ x: 2, y: 1 });
    });

    await Effect.runPromise(program.pipe(ctx));
  });
});
