import { Effect, Layer } from "effect";
import { Command } from "./layers/command";
import { Config } from "./layers/config";
import { State } from "./layers/state";
import { program } from "./program";

const runnable = program.pipe(
  Effect.provide(
    Layer.mergeAll(State.Live, Command.Live).pipe(
      Layer.provideMerge(Config.Live),
    ),
  ),
);

Effect.runPromiseExit(runnable).then(console.log);
