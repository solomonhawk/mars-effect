import { Position } from "./position";

// @NOTE: this type should be derivable from the CLI options using Command.ParseConfig<C>
export type AppLayersOpts = {
  readonly initialDirection: Direction;
  readonly initialX: number;
  readonly initialY: number;
  readonly width: number;
  readonly height: number;
  readonly obstacleDensity: number;
  readonly playbackSpeed: number;
};

export type Direction = "N" | "S" | "E" | "W";
export type Cmd = "f" | "b" | "l" | "r";

export type Rover = {
  position: Position;
  direction: Direction;
};

export type Planet = {
  width: number;
  height: number;
  obstacles: Position[];
};
