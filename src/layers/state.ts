import { Context, Effect, Layer, Ref } from "effect";
import { Config } from "./config";
import { type Rover } from "~/types";

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
