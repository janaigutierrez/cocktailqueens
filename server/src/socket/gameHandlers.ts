import { Server, Socket } from 'socket.io';
import { Game, GameMode, GameStatus } from '../models/Game';
import { Team } from '../models/Team';
import { BingoCard } from '../models/BingoCard';

export const registerGameHandlers = (io: Server, socket: Socket) => {
  // Admin selects which game mode to play
  socket.on('game:select-mode', async (data: { gameId: string; mode: GameMode }) => {
    try {
      const { gameId, mode } = data;
      const game = await Game.findById(gameId);
      if (!game) return;

      game.currentMode = mode;
      const newStatus: GameStatus = mode === 'cocktails' ? 'cocktails-prova1' : 'bingo';
      game.status = newStatus;

      // If replaying a mode, remove it from completedModes and reset its data
      if (game.completedModes.includes(mode)) {
        game.completedModes = game.completedModes.filter((m) => m !== mode);
        if (mode === 'cocktails') {
          game.prova1Assignments = [];
          game.prova2Submissions = [];
          game.prova3Config = { cocktails: [] };
          game.prova3Submissions = [];
          // Reset cocktail scores for all teams
          await Team.updateMany({ game: gameId }, {
            'scores.prova1': { taste: 0, presentation: 0 },
            'scores.prova2': { creativity: 0, taste: 0, presentation: 0 },
            'scores.prova3': 0,
          });
        } else {
          game.bingoSongPool = [];
          game.bingoWinners = { line: null, bingo: null };
          await BingoCard.deleteMany({ game: gameId });
          // Reset bingo scores for all teams
          await Team.updateMany({ game: gameId }, {
            'scores.bingo': { lines: 0, bingos: 0 },
          });
        }
        // Recalc total scores
        const teams = await Team.find({ game: gameId });
        for (const team of teams) {
          team.totalScore =
            team.scores.prova1.taste +
            team.scores.prova1.presentation +
            team.scores.prova2.creativity +
            team.scores.prova2.taste +
            team.scores.prova2.presentation +
            team.scores.prova3;
          await team.save();
        }
      }

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

  // Admin resets everything — new game from scratch
  socket.on('game:reset', async (data: { gameId: string }) => {
    try {
      const { gameId } = data;

      // Clean up old data
      await Team.deleteMany({ game: gameId });
      await BingoCard.deleteMany({ game: gameId });
      await Game.findByIdAndDelete(gameId);

      // Create fresh game
      const newGame = await Game.create({});

      io.emit('game:reset', { gameId: newGame._id });
    } catch (error) {
      socket.emit('error', { message: 'Failed to reset game' });
    }
  });
};
