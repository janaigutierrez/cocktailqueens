import { Server, Socket } from 'socket.io';
import { Game } from '../models/Game';
import { Team } from '../models/Team';
import { Cocktail } from '../models/Cocktail';
import { shuffleArray } from '../utils/shuffleArray';
import { recalcTotalScore } from '../utils/scoring';

export const registerProva1Handlers = (io: Server, socket: Socket) => {
  // Admin assigns random cocktails to teams
  socket.on('prova1:assign', async (data: { gameId: string }) => {
    try {
      const { gameId } = data;
      const game = await Game.findById(gameId);
      if (!game) return;

      const teams = await Team.find({ game: gameId });
      const cocktails = await Cocktail.find({ isActive: true });

      if (cocktails.length === 0) {
        socket.emit('error', { message: 'No hi ha coctels disponibles' });
        return;
      }

      const shuffled = shuffleArray([...cocktails]);
      const assignments = teams.map((team, i) => ({
        team: team._id,
        cocktail: shuffled[i % shuffled.length]._id,
      }));

      game.prova1Assignments = assignments;
      await game.save();

      // Send each team their specific cocktail
      for (const assignment of assignments) {
        const team = teams.find((t) => t._id.toString() === assignment.team.toString());
        const cocktail = cocktails.find(
          (c) => c._id.toString() === assignment.cocktail.toString()
        );

        if (team?.socketId && cocktail) {
          io.to(team.socketId).emit('prova1:assignment', {
            cocktail: { name: cocktail.name, ingredients: cocktail.ingredients },
          });
        }
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to assign cocktails' });
    }
  });

  // Admin scores a team for prova 1
  socket.on(
    'prova1:score',
    async (data: { gameId: string; teamId: string; taste: number; presentation: number }) => {
      try {
        const { gameId, teamId, taste, presentation } = data;

        const team = await Team.findById(teamId);
        if (!team) return;

        team.scores.prova1 = { taste, presentation };
        team.totalScore = recalcTotalScore(team.scores);
        await team.save();

        const teams = await Team.find({ game: gameId }).sort({ totalScore: -1 });
        io.emit('prova1:scored', { teamId, scores: team.scores });
        io.emit('ranking:update', { rankings: teams });
      } catch (error) {
        socket.emit('error', { message: 'Failed to score' });
      }
    }
  );
};
