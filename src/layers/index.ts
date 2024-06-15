import { Layer } from "effect";
import { AppLayersOpts } from "~/types";
import { makeConfigLive } from "./config";
import { State } from "./state";
import { Command } from "./command";

export function makeAppLayersLive(opts: AppLayersOpts) {
  return Layer.mergeAll(State.Live, Command.Live).pipe(
    Layer.provideMerge(makeConfigLive(opts)),
  );
}
