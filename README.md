# Collaborative Crosswords

An isomorphic TypeScript app for playing Cryptic Crosswords collaboratively. Very much a work-in-progress.

<https://collaborative-crosswords.herokuapp.com>

## Overview

The Client side is built with [create-react-app](https://create-react-app.dev/) and TypeScript (see the [README](./client/README.md)). The server is a small Express app written in TypeScript. Both sides communicate in real time using [Socket.io](https://socket.io/).

The server and client code have independent `package.json` and `tsconfig.json` config files, but share the code in `./client/src/shared`. This directory is copied to `./server/src/shared` in the server source code directory at server build time (there were issues with Webpack and CRA when I tried to use a symlink).

The source of the crossword is specified in `./server/src/data/crossword.yml`.
Clues are separated into `across` and `down` objects, and each clue is indexed under a `(row,col)` key in a `[clue, answer]` tuple. For example:

```yaml
across:
  0,2:
    - This is the clue
    - Wow
  2,0:
    - Another clue
    - Woah
down:
  0,3:
    - An impressive clue
    - Ooh
```

The parser will calculate the number of letters hints, and supports multiple word and hyphenated clues. The parser will throw a `ValidationError` on starting the server if the format does not match the expected format or if the clues are inconsistent.

## Developing

## Getting started

Run `docker-compose up` and open a browser at `http://localhost:3000`. The Create React App server will start on port 3000, which will proxy requests through to the Express server on port 4000. Both servers will refresh on changes to the source code.

Docker will create the `node_modules` directories in the built images, which won't be accessible to a code editor. To fix module resolution, run `yarn` in the `./client/` and `./server/` directories.

### Testing

To run the client-side tests:

```bash
> docker-compose run --rm client yarn test
```

To run the server-side tests:

```bash
> docker-compose run --rm server yarn test
```

### Linting

Linting on the client source code is performed by Create React App when it's launched in development mode. To lint the server source code:

```bash
> docker-compose run --rm server yarn lint
```

### Production

The `production` image specified in the Dockerfile is run in production on Heroku. If it goes wrong, try debugging with the local docker-compose production stack:

```bash
> docker-compose -f docker-compose.prod.yml up
```

## TODO

- Store the state outside of the Node process when in production (Redis?)
- Add many crosswords.
- Make it pretty.
- Allow split words (meh)
