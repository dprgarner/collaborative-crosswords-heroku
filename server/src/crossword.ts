import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import uuidv4 from 'uuid/v4';

import { PlayerAction, EffectAction } from './shared/types';
import { createInitialState, effectReducer } from './shared/reducer';
import loadCrossword from './loadCrossword';

export default function setupCrossword(io: SocketIO.Server): void {
  // TODO put this in Redis or something else instead of local state.
  const { clues, answers } = loadCrossword(
    fs.readFileSync(
      path.join(__dirname, '..', '..', 'data', 'crossword.yml'),
      'utf8',
    ),
  );
  let gameState = createInitialState(clues);

  setInterval(() => {
    if (!gameState.isComplete && _.isEqual(gameState.letters, answers)) {
      const completeAction = { type: 'COMPLETED' } as EffectAction;
      io.emit('effectAction', completeAction);
      gameState = effectReducer(gameState, completeAction);
    }
  }, 1000);

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
