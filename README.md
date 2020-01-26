# Collaborative Crosswords

An isomorphic TypeScript app for playing Cryptic Crosswords collaboratively. Very much a work-in-progress.

The Client side is built with [create-react-app](https://create-react-app.dev/) and TypeScript (see the [README](./client/README.md)). The server is a small Express app written in TypeScript. Both sides communicate in real time using [Socket.io](https://socket.io/).

The server and client code have independent `package.json` and `tsconfig.json` config files, but share the code in `./client/src/shared`. This directory is copied to `./src/shared` in the server source code directory at server build time (there were issues with Webpack and CRA when I tried to use a symlink).

## Developing

### Getting started

Run `docker-compose up` and open a browser at `http://localhost:3000`. The Create React App server will start on port 3000, which will proxy requests through to the Express server on port 4000. Both servers will refresh on changes to the source code.

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

The `production` image specified in the Dockerfile is run in production on Heroku.
