import { Context, Layer } from "effect";
import { Position } from "~/position";
import { Direction, Planet } from "~/types";

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
    initialPosition: new Position(0, 0),
    initialDirection: "N",
    planet: {
      height: 5,
      width: 5,
      obstacles: [],
    },
  }),
);
