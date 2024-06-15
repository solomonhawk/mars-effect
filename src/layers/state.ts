import { Context, Effect, Layer, Ref } from "effect";
import { Rover } from "~/types";
import { Config } from "./config";

export class State extends Context.Tag("@app/State")<
  State,
  {
    readonly rover: Ref.Ref<Rover>;
  }
>() {
  static Live = Layer.effect(
    State,
    Effect.gen(function* () {
      const config = yield* Config;

      return {
        rover: yield* Ref.make<Rover>({
          direction: config.initialDirection,
          position: config.initialPosition,
        }),
      };
    }),
  );
}
