import { Position } from "./position";

export type Direction = "N" | "S" | "E" | "W";
export type Command = "f" | "b" | "l" | "r";

export type Rover = {
  position: Position;
  direction: Direction;
};

export type Planet = {
  width: number;
  height: number;
  obstacles: Position[];
};
