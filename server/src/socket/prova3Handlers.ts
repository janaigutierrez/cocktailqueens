import { Server, Socket } from 'socket.io';
import { Game } from '../models/Game';
import { Team } from '../models/Team';
import { recalcTotalScore } from '../utils/scoring';

export const registerProva3Handlers = (io: Server, socket: Socket) => {
  // Admin sets up the 6 cocktails and opens guessing
  socket.on(
    'prova3:start',
    async (data: {
      gameId: string;
      cocktails: { number: number; correctName: string }[];
    }) => {
      try {
        const { gameId, cocktails } = data;
        const game = await Game.findById(gameId);
        if (!game) return;

        game.prova3Config = { cocktails };
        game.prova3Submissions = [];
        await game.save();

        const cocktailNumbers = cocktails.map((c) => c.number);
        io.emit('prova3:open', { cocktailNumbers });
      } catch (error) {
        socket.emit('error', { message: 'Failed to start prova3' });
      }
    }
  );

  // Team submits guesses
  socket.on(
    'prova3:submit',
    async (data: {
      gameId: string;
      teamId: string;
      guesses: { number: number; guessedName: string }[];
    }) => {
      try {
        const { gameId, teamId, guesses } = data;
        const game = await Game.findById(gameId);
        if (!game) return;

        const existingIdx = game.prova3Submissions.findIndex(
          (s) => s.team.toString() === teamId
        );
        const submission = { team: teamId as any, guesses };

        if (existingIdx >= 0) {
          game.prova3Submissions[existingIdx] = submission;
        } else {
          game.prova3Submissions.push(submission);
        }
        await game.save();

        socket.emit('prova3:submission-ack', { success: true });
      } catch (error) {
        socket.emit('error', { message: 'Failed to submit guesses' });
      }
    }
  );

  // Admin reveals answers - auto-score
  socket.on('prova3:reveal', async (data: { gameId: string }) => {
    try {
      const { gameId } = data;
      const game = await Game.findById(gameId);
      if (!game) return;

      const correctAnswers = game.prova3Config.cocktails;
      const teamResults = [];

      for (const submission of game.prova3Submissions) {
        let correctCount = 0;

        for (const guess of submission.guesses) {
          const correct = correctAnswers.find((ca) => ca.number === guess.number);
          if (
            correct &&
            guess.guessedName.trim().toLowerCase() ===
              correct.correctName.trim().toLowerCase()
          ) {
            correctCount++;
          }
        }

        const score = correctCount * 2;
        const team = await Team.findById(submission.team);
        if (team) {
          team.scores.prova3 = score;
          team.totalScore = recalcTotalScore(team.scores);
          await team.save();
        }

        teamResults.push({
          teamId: submission.team.toString(),
          correctCount,
          score,
        });
      }

      const teams = await Team.find({ game: gameId }).sort({ totalScore: -1 });
      io.emit('prova3:results', { correctAnswers, teamResults });
      io.emit('ranking:update', { rankings: teams });
    } catch (error) {
      socket.emit('error', { message: 'Failed to reveal results' });
    }
  });
};
