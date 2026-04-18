import { Server, Socket } from 'socket.io';
import { Game } from '../models/Game';
import { Team } from '../models/Team';
import { Song } from '../models/Song';
import { BingoCard } from '../models/BingoCard';
import { generateBingoCard } from '../utils/generateBingoCard';

export const registerBingoHandlers = (io: Server, socket: Socket) => {
  // Admin starts bingo - generate cards
  socket.on('bingo:start', async (data: { gameId: string }) => {
    try {
      const { gameId } = data;
      const game = await Game.findById(gameId);
      if (!game) return;

      const songs = await Song.find({ isActive: true });
      if (songs.length < 15) {
        socket.emit('error', { message: 'Necessites almenys 15 cancons' });
        return;
      }

      game.bingoSongPool = songs.map((s) => s._id);
      game.bingoPlayedSongs = [];
      game.bingoCurrentSong = null;
      game.bingoWinners = { line: null, bingo: null };
      await game.save();

      // Delete old cards and generate new ones
      await BingoCard.deleteMany({ game: gameId });

      const teams = await Team.find({ game: gameId });
      for (const team of teams) {
        const cells = generateBingoCard(songs);
        const card = await BingoCard.create({
          game: gameId,
          team: team._id,
          cells,
        });

        // Send card to team with populated song data
        const populatedCard = await BingoCard.findById(card._id).populate('cells.song');
        if (team.socketId && populatedCard) {
          io.to(team.socketId).emit('bingo:card', { card: populatedCard });
        }
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to start bingo' });
    }
  });

  // Admin selects next song
  socket.on('bingo:next-song', async (data: { gameId: string; songId: string }) => {
    try {
      const { gameId, songId } = data;
      const game = await Game.findById(gameId);
      if (!game) return;

      game.bingoCurrentSong = songId as any;
      if (!game.bingoPlayedSongs.some((s) => s.toString() === songId)) {
        game.bingoPlayedSongs.push(songId as any);
      }
      await game.save();

      io.emit('bingo:current-song', { songNumber: game.bingoPlayedSongs.length });
    } catch (error) {
      socket.emit('error', { message: 'Failed to advance song' });
    }
  });

  // Team marks a cell
  socket.on(
    'bingo:mark-cell',
    async (data: { gameId: string; teamId: string; cellIndex: number }) => {
      try {
        const { gameId, teamId, cellIndex } = data;
        const card = await BingoCard.findOne({ game: gameId, team: teamId }).populate(
          'cells.song'
        );
        if (!card || !card.cells[cellIndex]) return;

        card.cells[cellIndex].markedByTeam = true;
        await card.save();

        const team = await Team.findById(teamId);
        const song = card.cells[cellIndex].song as any;

        // Notify admin
        io.emit('bingo:cell-marked', {
          teamId,
          teamName: team?.name || 'Desconegut',
          cellIndex,
          songTitle: song?.title || '?',
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark cell' });
      }
    }
  );

  // Admin validates a cell
  socket.on(
    'bingo:validate-cell',
    async (data: {
      gameId: string;
      teamId: string;
      cellIndex: number;
      valid: boolean;
    }) => {
      try {
        const { gameId, teamId, cellIndex, valid } = data;
        const card = await BingoCard.findOne({ game: gameId, team: teamId });
        if (!card || !card.cells[cellIndex]) return;

        card.cells[cellIndex].validatedByAdmin = valid;
        if (!valid) {
          card.cells[cellIndex].markedByTeam = false;
        }
        await card.save();

        const team = await Team.findById(teamId);
        if (team?.socketId) {
          io.to(team.socketId).emit('bingo:cell-validated', { cellIndex, valid });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to validate cell' });
      }
    }
  );

  // Team claims a line
  socket.on(
    'bingo:claim-line',
    async (data: { gameId: string; teamId: string }) => {
      try {
        const { gameId, teamId } = data;
        const card = await BingoCard.findOne({ game: gameId, team: teamId });
        if (!card) return;

        // Check if any row is complete (all 5 validated)
        for (let row = 0; row < 3; row++) {
          const rowCells = card.cells.filter((c) => c.row === row);
          const allValidated = rowCells.length === 5 && rowCells.every((c) => c.validatedByAdmin);
          if (allValidated) {
            const game = await Game.findById(gameId);
            if (!game || game.bingoWinners.line) return;

            game.bingoWinners.line = teamId as any;
            await game.save();

            const team = await Team.findById(teamId);
            if (team) {
              team.scores.bingo.lines += 1;
              await team.save();
            }

            io.emit('bingo:winner', {
              type: 'line',
              teamId,
              teamName: team?.name || 'Desconegut',
            });
            return;
          }
        }

        socket.emit('error', { message: 'No tens cap linia completa validada!' });
      } catch (error) {
        socket.emit('error', { message: 'Failed to claim line' });
      }
    }
  );

  // Team claims bingo
  socket.on(
    'bingo:claim-bingo',
    async (data: { gameId: string; teamId: string }) => {
      try {
        const { gameId, teamId } = data;
        const card = await BingoCard.findOne({ game: gameId, team: teamId });
        if (!card) return;

        const allValidated = card.cells.every((c) => c.validatedByAdmin);
        if (!allValidated) {
          socket.emit('error', { message: 'No tens totes les caselles validades!' });
          return;
        }

        const game = await Game.findById(gameId);
        if (!game || game.bingoWinners.bingo) return;

        game.bingoWinners.bingo = teamId as any;
        game.status = 'bingo-results';
        await game.save();

        const team = await Team.findById(teamId);
        if (team) {
          team.scores.bingo.bingos += 1;
          await team.save();
        }

        io.emit('bingo:winner', {
          type: 'bingo',
          teamId,
          teamName: team?.name || 'Desconegut',
        });
        io.emit('game:phase-change', { status: 'bingo-results', currentMode: 'bingo' });
      } catch (error) {
        socket.emit('error', { message: 'Failed to claim bingo' });
      }
    }
  );
};
