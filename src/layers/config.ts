import { Context, Layer } from "effect";
import { Direction, Planet, Position } from "~/types";

export class Config extends Context.Tag("@app/Config")<
  Config,
  {
    readonly logMoves: boolean;
    readonly initialPosition: Position;
    readonly initialDirection: Direction;
    readonly planet: Planet;
  }
>() {}

export const ConfigLive = Layer.succeed(
  Config,
  Config.of({
    logMoves: true,
    initialPosition: { x: 0, y: 0 },
    initialDirection: "N",
    planet: {
      height: 5,
      width: 5,
      obstacles: [],
    },
  }),
);
