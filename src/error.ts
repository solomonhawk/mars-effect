import { type Position } from "./position";

export class ObstacleError extends Error {
  _tag = "ObstacleError";

  constructor(
    readonly message: string,
    readonly position: Position,
  ) {
    super(message);

    Object.setPrototypeOf(this, ObstacleError.prototype);

    this.name = this.constructor.name;
  }

  public print() {
    return `[!] Rover hit an obstacle at x=${this.position.x}, y=${this.position.y}!`;
  }
}
