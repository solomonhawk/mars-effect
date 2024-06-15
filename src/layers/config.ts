import { Context, Layer } from "effect";
import { makeObstacles } from "~/helpers";
import { Position } from "~/position";
import { type AppLayersOpts, type Direction, type Planet } from "~/types";

export class Config extends Context.Tag("@app/Config")<
  Config,
  {
    readonly playbackSpeed: number;
    readonly initialPosition: Position;
    readonly initialDirection: Direction;
    readonly logMoves: boolean;
    readonly planet: Planet;
  }
>() {
  static Live = Layer.succeed(
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
}

export function makeConfigLive(opts: AppLayersOpts) {
  const initialPosition = new Position(opts.initialX, opts.initialY);

  return Layer.succeed(
    Config,
    Config.of({
      playbackSpeed: opts.playbackSpeed,
      initialPosition,
      initialDirection: opts.initialDirection,
      logMoves: false,
      planet: {
        height: opts.height,
        width: opts.width,
        obstacles: makeObstacles(
          opts.width,
          opts.height,
          opts.obstacleDensity,
          [initialPosition],
        ),
      },
    }),
  );
}
