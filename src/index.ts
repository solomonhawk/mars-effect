import { Effect } from "effect";
import { program } from "./program";

Effect.runPromiseExit(program).then(console.log);
