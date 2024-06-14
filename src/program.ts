import { Effect } from "effect";
import * as Ref from "effect/Ref";
import { Config } from "./layers/config";
import { CommandService } from "./services/command";
import { Rover } from "./types";

export const program = Effect.gen(function* (_) {
  const config = yield* _(Config);
  const commandService = yield* _(CommandService);

  const roverRef = yield* _(
    Ref.make<Rover>({
      direction: config.initialDirection,
      position: config.initialPosition,
    }),
  );

  yield* commandService.runCommands(roverRef, ["f"]);

  return yield* _(roverRef.get);
});
