export class ObstacleError extends Error {
  _tag = "ObstacleError";

  constructor(readonly message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
