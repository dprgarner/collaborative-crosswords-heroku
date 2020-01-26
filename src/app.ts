import 'source-map-support/register';

import _ from 'lodash';
import express from 'express';
import http from 'http';
import socketIo from 'socket.io';

import { CluesData } from './shared/types';
import { State, PlayerAction } from './shared/types';

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

const gameState: State = {
  active: null,
  clues,
  letters: _.range(clues.height).map(() => _.range(clues.height).map(() => '')),
};

io.on('connection', socket => {
  console.log('a socket connected');
  socket.emit('serverState', gameState);

  socket.on('disconnect', () => {
    console.log('the socket disconnected');
  });

  socket.on('playerAction', (playerAction: PlayerAction) => {
    console.log(playerAction);
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
