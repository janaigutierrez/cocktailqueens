import { Server, Socket } from 'socket.io';
import { Game } from '../models/Game';
import { Team } from '../models/Team';
import { recalcTotalScore } from '../utils/scoring';

export const registerProva2Handlers = (io: Server, socket: Socket) => {
  // Admin opens submissions
  socket.on('prova2:start', async (data: { gameId: string }) => {
    io.emit('prova2:open', {});
  });

  // Team submits their cocktail
  socket.on(
    'prova2:submit',
    async (data: {
      gameId: string;
      teamId: string;
      cocktailName: string;
      description: string;
    }) => {
      try {
        const { gameId, teamId, cocktailName, description } = data;
        const game = await Game.findById(gameId);
        if (!game) return;

        const team = await Team.findById(teamId);
        if (!team) return;

        // Store submission
        const existingIdx = game.prova2Submissions.findIndex(
          (s) => s.team.toString() === teamId
        );
        const submission = { team: team._id, cocktailName, description };

        if (existingIdx >= 0) {
          game.prova2Submissions[existingIdx] = submission;
        } else {
          game.prova2Submissions.push(submission);
        }
        await game.save();

        // Confirm to team
        socket.emit('prova2:submission-ack', { success: true });

        // Notify admin
        io.emit('prova2:submitted', {
          teamId,
          teamName: team.name,
          cocktailName,
          description,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to submit' });
      }
    }
  );

  // Admin scores a team
  socket.on(
    'prova2:score',
    async (data: {
      gameId: string;
      teamId: string;
      creativity: number;
      taste: number;
      presentation: number;
    }) => {
      try {
        const { gameId, teamId, creativity, taste, presentation } = data;

        const team = await Team.findById(teamId);
        if (!team) return;

        team.scores.prova2 = { creativity, taste, presentation };
        team.totalScore = recalcTotalScore(team.scores);
        await team.save();

        const teams = await Team.find({ game: gameId }).sort({ totalScore: -1 });
        io.emit('prova2:scored', { teamId, scores: team.scores });
        io.emit('ranking:update', { rankings: teams });
      } catch (error) {
        socket.emit('error', { message: 'Failed to score' });
      }
    }
  );
};
