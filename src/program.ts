import { Effect } from "effect";
import { Command } from "./layers/command";
import { State } from "./layers/state";

export const program = Effect.gen(function* () {
  const { runCommands } = yield* Command;
  const { rover } = yield* State;

  yield* runCommands(["f"]);

  return yield* rover.get;
});
