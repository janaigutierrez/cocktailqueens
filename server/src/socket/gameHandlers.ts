import { Server, Socket } from 'socket.io';
import { Game, GameMode, GameStatus } from '../models/Game';
import { Team } from '../models/Team';

export const registerGameHandlers = (io: Server, socket: Socket) => {
  // Admin selects which game mode to play
  socket.on('game:select-mode', async (data: { gameId: string; mode: GameMode }) => {
    try {
      const { gameId, mode } = data;
      const game = await Game.findById(gameId);
      if (!game) return;

      if (game.completedModes.includes(mode)) {
        socket.emit('error', { message: `${mode} already completed` });
        return;
      }

      game.currentMode = mode;
      const newStatus: GameStatus = mode === 'cocktails' ? 'cocktails-prova1' : 'bingo';
      game.status = newStatus;
      await game.save();

      io.emit('game:phase-change', { status: game.status, currentMode: game.currentMode });
    } catch (error) {
      socket.emit('error', { message: 'Failed to select mode' });
    }
  });

  // Admin advances to next phase within current mode
  socket.on('game:advance', async (data: { gameId: string }) => {
    try {
      const { gameId } = data;
      const game = await Game.findById(gameId);
      if (!game) return;

      const transitions: Record<string, GameStatus> = {
        'cocktails-prova1': 'cocktails-prova2',
        'cocktails-prova2': 'cocktails-prova3',
        'cocktails-prova3': 'cocktails-results',
      };

      const nextStatus = transitions[game.status];
      if (nextStatus) {
        game.status = nextStatus;
        await game.save();
        io.emit('game:phase-change', { status: game.status, currentMode: game.currentMode });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to advance' });
    }
  });

  // Admin finishes current mode and goes back to lobby
  socket.on('game:back-to-lobby', async (data: { gameId: string }) => {
    try {
      const { gameId } = data;
      const game = await Game.findById(gameId);
      if (!game || !game.currentMode) return;

      game.completedModes.push(game.currentMode);
      game.currentMode = null;

      // If both modes completed, finish the game
      if (game.completedModes.length >= 2) {
        game.status = 'finished';
      } else {
        game.status = 'lobby-intermedi';
      }

      await game.save();
      io.emit('game:phase-change', { status: game.status, currentMode: game.currentMode });
      io.emit('lobby:reopen', { completedModes: game.completedModes });
    } catch (error) {
      socket.emit('error', { message: 'Failed to return to lobby' });
    }
  });

  // Admin finishes the entire game
  socket.on('game:finish', async (data: { gameId: string }) => {
    try {
      const { gameId } = data;
      const game = await Game.findById(gameId);
      if (!game) return;

      if (game.currentMode) {
        game.completedModes.push(game.currentMode);
      }
      game.currentMode = null;
      game.status = 'finished';
      await game.save();

      const teams = await Team.find({ game: gameId }).sort({ totalScore: -1 });
      io.emit('game:phase-change', { status: 'finished', currentMode: null });
      io.emit('ranking:update', { rankings: teams });
    } catch (error) {
      socket.emit('error', { message: 'Failed to finish game' });
    }
  });
};
