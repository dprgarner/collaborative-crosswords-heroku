# Collaborative Crosswords

An isomorphic TypeScript app for playing Cryptic Crosswords collaboratively. Very much a work-in-progress.

<https://collaborative-crosswords.herokuapp.com>

## Overview

The Client side is built with [create-react-app](https://create-react-app.dev/) and TypeScript (see the [README](./client/README.md)). The server is a small Express app written in TypeScript. Both sides communicate in real time using [Socket.io](https://socket.io/).

The server and client code have independent `package.json` and `tsconfig.json` config files, but share the code in `./client/src/shared`. This directory is copied to `./server/src/shared` in the server source code directory at server build time (there were issues with Webpack and CRA when I tried to use a symlink).

## Developing

## Getting started

Run `docker-compose up` and open a browser at `http://localhost:3000`. The Create React App server will start on port 3000, which will proxy requests through to the Express server on port 4000. Both servers will refresh on changes to the source code.

Docker will create the `node_modules` directories in the built images, which won't be accessible to a code editor. To fix module resolution, run `yarn` in the `./client/` and `./server/` directories.

### Testing

No server-side tests yet. :(

To run the client-side tests:

```bash
> docker-compose run --rm client yarn test
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

- Event when user completes the crossword, and action to reset
- Different cursors for different active users
- Improve the cursor (highlight the whole clue, not just the letter)
- Store crosswords in Yaml
- Write a better crossword
- Store the state outside of the Node process when in production (Redis?)
- Add many crosswords.
