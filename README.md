# Collaborative Crosswords

An isomorphic TypeScript app for playing Cryptic Crosswords collaboratively. Very much a work-in-progress.

The Client side is built with [create-react-app](https://create-react-app.dev/) and TypeScript (see the [README](./client/README.md)). The server is a small Express app written in TypeScript. Both sides communicate in real time using [Socket.io](https://socket.io/).

The server and client code have independent `package.json` and `tsconfig.json` config files, but share the code in `./client/src/shared`. This directory is copied to `./src/shared` in the server source code directory at server build time (there were issues with Webpack and CRA when I tried to use a symlink).

<!--

# Developing

Open two terminals. Start the development server in one terminal:

```bash
> yarn
> yarn start
```

This server runs on port 4000 and restarts on changes to the source code.

Next, start the Create React App development server:

```bash
> cd client
> yarn
> yarn start
```

This will start a hot-reloading server on port 3000. The CRA development server proxies the Socket.io requests on to the development server on port 4000.

# Testing

No server-side tests yet. :(

To run the client-side tests:

```
> cd client && yarn test
```

# Linting

Linting on the client source code is performed by create-react-app when in development mode. To lint the server source code:

```
> yarn lint
```

# Production

To build and run in production mode:

```bash
> cd client
> yarn --production
> yarn build
> cd ../
> yarn --production
> yarn build
> yarn start:prod
```

The server will start on port 4000.

-->
