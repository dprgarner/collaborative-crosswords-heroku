import _ from 'lodash';
import uuidv4 from 'uuid/v4';

import { CluesData, State, PlayerAction, EffectAction } from './shared/types';
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
  // TODO put this in Redis or something else instead of local state.
  let gameState: State = {
    cursors: {},
    clues,
    letters: _.range(clues.height).map(() =>
      _.range(clues.height).map(() => ''),
    ),
  };

  io.on('connection', socket => {
    const playerId = uuidv4();
    console.log('Assigned ID: ', playerId);
    socket.emit('effectAction', {
      type: 'SET_INITIAL_DATA',
      playerId,
      state: gameState,
    } as EffectAction);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', playerId);
      const action: EffectAction = { type: 'PLAYER_DISCONNECTED', playerId };
      gameState = effectReducer(gameState, action);
      socket.broadcast.emit('effectAction', action);
    });

    socket.on('playerAction', (playerAction: PlayerAction) => {
      gameState = effectReducer(gameState, playerAction);
      socket.broadcast.emit('effectAction', playerAction);
    });
  });
}
