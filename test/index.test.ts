import { Context, Effect, Layer } from "effect";
import { isSuccess } from "effect/Exit";
import * as Ref from "effect/Ref";
import { Config } from "~/layers/config";
import { CommandService, CommandServiceDefaultImpl } from "~/services/command";
import { Rover } from "~/types";

describe("without any obstacles", () => {
  const ConfigTest = Layer.succeed(
    Config,
    Config.of({
      initialPosition: { x: 0, y: 0 },
      initialDirection: "N",
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

  it("follows a `f` command", async () => {
    const roverRef = Effect.runSync(
      Ref.make<Rover>({
        direction: "N",
        position: { x: 0, y: 0 },
      }),
    );

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
    const roverRef = Effect.runSync(
      Ref.make<Rover>({
        direction: "N",
        position: { x: 0, y: 0 },
      }),
    );

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
    const roverRef = Effect.runSync(
      Ref.make<Rover>({
        direction: "N",
        position: { x: 0, y: 0 },
      }),
    );

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
    const roverRef = Effect.runSync(
      Ref.make<Rover>({
        direction: "N",
        position: { x: 0, y: 0 },
      }),
    );

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
