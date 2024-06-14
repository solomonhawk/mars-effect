import { Context, Layer, Ref } from "effect";
import { Position } from "~/position";
import { Direction, Planet } from "~/types";

export class Config extends Context.Tag("@app/Config")<
  Config,
  {
    readonly playbackSpeed: number;
    readonly initialPosition: Position;
    readonly initialDirection: Direction;
    readonly logMoves: boolean;
    readonly planet: Planet;
  }
>() {}

export const ConfigLive = Layer.succeed(
  Config,
  Config.of({
    playbackSpeed: 200,
    initialPosition: new Position(0, 0),
    initialDirection: "N",
    logMoves: true,
    planet: {
      height: 5,
      width: 5,
      obstacles: [],
    },
  }),
);
