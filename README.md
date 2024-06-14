# Mars Rover

An implementation of the mars rover kata in TypeScript using [EffectTS](https://effect.website/).

## Links

- [Kata](https://kata-log.rocks/mars-rover-kata)
- [Effect Intro Article](https://ybogomolov.me/01-effect-intro)
- [Effect Crash Course Repo](https://github.com/pigoz/effect-crashcourse/blob/master/001-basic.ts)

## Development & Usage

Install NPM dependencies:

    $ npm install

Run the sample program (it doesn't [do much](./src/index.ts)):

    $ npm run start

Run the interactive CLI (pass `-h` or `--help` to see options):

    $ npm run cli -- -h

Run tests:

    $ npm test

Run tests in watch mode:

    $ npm test:watch

## Thoughts

- I enjoy this programming paradigm (I read one description that suggested that Effect is to TS what NextJS or Remix is to React, which is interesting - it is described as a superset of TS)
- It's a steep learning curve, and I wouldn't reach for Effect on a production client application unless I knew that the team supporting it was bought in already
- The benefits of the approach are less apparent at smaller scales, but I can imagine how it begins to pay off as an application grows and changes over time
- The TS magic is pretty amazing. Having type-checked dependency injection is quite interesting
- Everything is more complicated, due to the indirection introduced by Effect
- It's different (and a bit unfamiliar) to think about structuring an application using effects rather than the usual data/immediate functions/control flow
- `Effect.gen(..)` is super useful and nice to write except for all the `yield* _(..)` noise, which is a bummer