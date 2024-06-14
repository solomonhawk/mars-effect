import { Context, Effect, Exit, Layer } from "effect";
import { isFailure, isSuccess } from "effect/Exit";
import * as Ref from "effect/Ref";
import { Config } from "~/layers/config";
import { Position } from "~/position";
import { CommandService, CommandServiceDefaultImpl } from "~/services/command";
import { Rover } from "~/types";

describe("without any obstacles", () => {
  const ConfigTest = Layer.succeed(
    Config,
    Config.of({
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

  const context = Context.empty().pipe(
    Context.add(CommandService, CommandServiceDefaultImpl),
  );

  let roverRef: Ref.Ref<Rover>;

  beforeEach(() => {
    roverRef = Effect.runSync(
      Ref.make<Rover>({
        direction: "N",
        position: new Position(0, 0),
      }),
    );
  });

  it("follows a `f` command", async () => {
    const program = Effect.gen(function* (_) {
      const commandService = yield* _(CommandService);

      yield* _(commandService.runCommands(roverRef, ["f"]));
    });

    const runnable = program.pipe(
      Effect.provide(ConfigTest),
      Effect.provide(context),
    );

    const result = await Effect.runPromiseExit(runnable);
    const rover = await Effect.runPromise(roverRef.get);

    expect(isSuccess(result)).toBe(true);
    expect(rover.position).toEqual({ x: 0, y: 4 });
  });

  it("follows a `b` command", async () => {
    const program = Effect.gen(function* (_) {
      const commandService = yield* _(CommandService);

      yield* _(commandService.runCommands(roverRef, ["b"]));
    });

    const runnable = program.pipe(
      Effect.provide(ConfigTest),
      Effect.provide(context),
    );

    const result = await Effect.runPromiseExit(runnable);
    const rover = await Effect.runPromise(roverRef.get);

    expect(isSuccess(result)).toBe(true);
    expect(rover.position).toEqual({ x: 0, y: 1 });
  });

  it("follows a `l` command", async () => {
    const program = Effect.gen(function* (_) {
      const commandService = yield* _(CommandService);

      yield* _(commandService.runCommands(roverRef, ["l"]));
    });

    const runnable = program.pipe(
      Effect.provide(ConfigTest),
      Effect.provide(context),
    );

    const result = await Effect.runPromiseExit(runnable);
    const rover = await Effect.runPromise(roverRef.get);

    expect(isSuccess(result)).toBe(true);
    expect(rover.direction).toEqual("W");
  });

  it("follows a `r` command", async () => {
    const program = Effect.gen(function* (_) {
      const commandService = yield* _(CommandService);

      yield* _(commandService.runCommands(roverRef, ["r"]));
    });

    const runnable = program.pipe(
      Effect.provide(ConfigTest),
      Effect.provide(context),
    );

    const result = await Effect.runPromiseExit(runnable);
    const rover = await Effect.runPromise(roverRef.get);

    expect(isSuccess(result)).toBe(true);
    expect(rover.direction).toEqual("E");
  });
});

describe("with obstacles", () => {
  const ConfigTest = Layer.succeed(
    Config,
    Config.of({
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

  const context = Context.empty().pipe(
    Context.add(CommandService, CommandServiceDefaultImpl),
  );

  let roverRef: Ref.Ref<Rover>;

  beforeEach(() => {
    roverRef = Effect.runSync(
      Ref.make<Rover>({
        direction: "N",
        position: new Position(0, 0),
      }),
    );
  });

  it("follows commands until an obstacle is encountered and ignores the rest", async () => {
    const program = Effect.gen(function* (_) {
      const commandService = yield* _(CommandService);

      yield* _(
        commandService.runCommands(roverRef, [
          "r", // 0,0 E
          "f", // 1,0 E
          "f", // 2,0 E
          "r", // 2,0 S
          "f", // 2,1 S
          "f", // 2,2 S (x)
          "f", // 2,3 S
          "l", // 2,3 E
          "b", // 1,3 E
        ]),
      );
    });

    const runnable = program.pipe(
      Effect.provide(ConfigTest),
      Effect.provide(context),
    );

    const result = await Effect.runPromiseExit(runnable);
    const rover = await Effect.runPromise(roverRef.get);

    expect(isFailure(result)).toBe(true);
    expect(rover.position).toEqual({ x: 2, y: 1 });

    Exit.mapError(result, (e) => {
      expect(e.message).toBe("Hit something!");
      expect(e.position).toEqual({ x: 2, y: 2 });
    });
  });
});
