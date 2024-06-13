import { Effect } from "effect";

export const program = Effect.succeed(1);

export type Position = {
  x: number;
  y: number;
};

export type Rover = {
  position: Position;
  direction: "N" | "S" | "E" | "W";
};

export type Command = "f" | "b" | "l" | "r";

export type Planet = {
  width: number;
  height: number;
  obstacles: Position[];
};
