import { Planet, Rover, runCommands } from "~/program";
import { Effect } from "effect";
import * as Ref from "effect/Ref";

describe("without any obstacles", () => {
  it("follows a forward command", async () => {
    const rover: Rover = {
      direction: "N",
      position: { x: 0, y: 0 },
    };

    const planet: Planet = {
      width: 5,
      height: 5,
      obstacles: [],
    };

    const roverRef = Ref.unsafeMake(rover);

    const _result = await Effect.runPromise(
      runCommands(roverRef, planet, ["f"]).pipe(
        Effect.catchTag("ObstacleError", (error) => {
          console.log(`Recovering from error ${error}`);
          return roverRef.get;
        }),
      ),
    );

    roverRef.get.pipe(
      Effect.tap((r) => {
        expect(r.position).toEqual({ x: 0, y: 1 });
      }),
    );
  });
});
