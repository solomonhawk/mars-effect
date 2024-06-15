import { type Position } from "./position";

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
