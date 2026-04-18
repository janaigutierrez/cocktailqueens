import { Server, Socket } from 'socket.io';
import { Team } from '../models/Team';
import { Game } from '../models/Game';

export const registerLobbyHandlers = (io: Server, socket: Socket) => {
  socket.on('team:join', async (data: { teamName: string; gameId: string }) => {
    try {
      const { teamName, gameId } = data;

      // Check if team already exists (reconnection)
      let team = await Team.findOne({ game: gameId, name: teamName });

      if (team) {
        team.isConnected = true;
        team.socketId = socket.id;
        await team.save();
      } else {
        team = await Team.create({
          name: teamName,
          game: gameId,
          isConnected: true,
          socketId: socket.id,
        });
      }

      socket.data.teamId = team._id.toString();
      socket.data.gameId = gameId;

      const teams = await Team.find({ game: gameId });
      io.emit('team:joined', { team });
      socket.emit('teams:list', { teams });
    } catch (error) {
      socket.emit('error', { message: 'Failed to join' });
    }
  });

  socket.on('disconnect', async () => {
    try {
      if (socket.data.teamId) {
        await Team.findByIdAndUpdate(socket.data.teamId, {
          isConnected: false,
          socketId: null,
        });
        io.emit('team:disconnected', { teamId: socket.data.teamId });
      }
    } catch (error) {
      console.error('Disconnect handler error:', error);
    }
  });
};
