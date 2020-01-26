import 'source-map-support/register';

import _ from 'lodash';
import express from 'express';
import http from 'http';
import socketIo from 'socket.io';

import { CluesData } from './shared/types';
import { ServerState } from './shared/fromServer';

const clues: CluesData = {
  width: 4,
  height: 4,
  across: {
    order: [1, 2],
    byNumber: {
      1: { clue: 'The sound a doggy makes', size: 4, row: 0, col: 0 },
      2: { clue: 'You do this to a door', size: 4, row: 2, col: 0 },
    },
  },
  down: {
    order: [1],
    byNumber: {
      1: { clue: 'Lots of trees', size: 4, row: 0, col: 0 },
    },
  },
};

const PORT = 4000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static('client/build'));
}

io.on('connection', socket => {
  console.log('a socket connected');

  const letters = _.range(clues.height).map(() =>
    _.range(clues.height).map(() => ''),
  );
  const serverState: ServerState = {
    clues,
    letters,
  };
  socket.emit('serverState', serverState);

  socket.on('disconnect', () => {
    console.log('the socket disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
