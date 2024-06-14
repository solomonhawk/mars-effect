import { Context, Effect } from "effect";
import { ConfigLive } from "./layers/config";
import { program } from "./program";
import { CommandService, CommandServiceDefaultImpl } from "./services/command";

const context = Context.empty().pipe(
  Context.add(CommandService, CommandServiceDefaultImpl),
);

const runnable = program.pipe(
  Effect.provide(ConfigLive),
  Effect.provide(context),
);

Effect.runPromiseExit(runnable).then(console.log);
