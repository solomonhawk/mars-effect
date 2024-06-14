import { Effect } from "effect";
import * as Ref from "effect/Ref";
import { Config } from "./layers/config";
import { CommandService } from "./services/command";
import { Rover } from "./types";

export const program = Effect.gen(function* () {
  const config = yield* Config;
  const commandService = yield* CommandService;

  const roverRef = yield* Ref.make<Rover>({
    direction: config.initialDirection,
    position: config.initialPosition,
  });

  yield* commandService.runCommands(roverRef, ["f"]);

  return yield* roverRef.get;
});
