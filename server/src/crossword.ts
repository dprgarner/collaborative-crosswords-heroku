import _ from 'lodash';

import { CluesData, State, PlayerAction } from './shared/types';
import { effectReducer } from './shared/reducer';

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

export default function setupCrossword(io: SocketIO.Server): void {
  // TODO go more 12-factor app and have this in Redis or something else, just
  // not local state.
  let gameState: State = {
    active: null,
    clues,
    letters: _.range(clues.height).map(() =>
      _.range(clues.height).map(() => ''),
    ),
  };

  io.on('connection', socket => {
    console.log('a socket connected');
    socket.emit('serverState', gameState);

    socket.on('disconnect', () => {
      console.log('the socket disconnected');
    });

    socket.on('playerAction', (playerAction: PlayerAction) => {
      gameState = effectReducer(gameState, playerAction);
      socket.broadcast.emit('playerAction', playerAction);
    });
  });
}
