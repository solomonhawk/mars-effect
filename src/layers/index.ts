import { Layer } from "effect";
import { Command } from "./command";
import { makeConfigLive } from "./config";
import { State } from "./state";
import { type AppLayersOpts } from "~/cli";

export function makeAppLayersLive(opts: AppLayersOpts) {
  return Layer.mergeAll(State.Live, Command.Live).pipe(
    Layer.provideMerge(makeConfigLive(opts)),
  );
}
