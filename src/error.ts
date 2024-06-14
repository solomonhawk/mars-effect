import { Position } from "./types";

export class ObstacleError extends Error {
  _tag = "ObstacleError";

  constructor(
    readonly message: string,
    readonly position: Position,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
