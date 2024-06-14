import { Context, Effect, Layer } from "effect";
import { isSuccess } from "effect/Exit";
import * as Ref from "effect/Ref";
import { Config, ConfigLive } from "~/layers/config";
import { CommandService, CommandServiceDefaultImpl } from "~/services/command";
import { Rover } from "~/types";

describe("without any obstacles", () => {
  it("follows a forward command", async () => {
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
      Effect.provide(ConfigLive),
      Effect.provide(context),
      Effect.andThen(() => {}),
    );

    const result = await Effect.runPromiseExit(runnable);

    expect(isSuccess(result)).toBe(true);

    roverRef.get.pipe(
      Effect.tap((r) => {
        expect(r.position).toEqual({ x: 0, y: 1 });
      }),
    );
  });
});
