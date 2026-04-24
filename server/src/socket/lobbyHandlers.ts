import { Server, Socket } from 'socket.io';
import crypto from 'crypto';
import { Team } from '../models/Team';
import { Game } from '../models/Game';
import { BingoCard } from '../models/BingoCard';

// Grace period: 60 seconds before marking as disconnected
const DISCONNECT_GRACE_MS = 60_000;
const disconnectTimers = new Map<string, NodeJS.Timeout>();

export const registerLobbyHandlers = (io: Server, socket: Socket) => {
  // New team join - generates a device token
  socket.on('team:join', async (data: { teamName: string; gameId: string }) => {
    try {
      const { teamName, gameId } = data;

      // Check if team already exists (name-based reconnection from lobby)
      let team = await Team.findOne({ game: gameId, name: teamName });

      if (team) {
        // Cancel any pending disconnect timer
        cancelDisconnectTimer(team._id.toString());

        team.isConnected = true;
        team.socketId = socket.id;
        team.lastSeen = new Date();
        await team.save();
      } else {
        const deviceToken = crypto.randomUUID();
        team = await Team.create({
          name: teamName,
          game: gameId,
          isConnected: true,
          socketId: socket.id,
          deviceToken,
        });
      }

      socket.data.teamId = team._id.toString();
      socket.data.gameId = gameId;

      // Send token to the client for persistent storage
      socket.emit('team:token', { token: team.deviceToken, team });

      const game = await Game.findById(gameId);
      const teams = await Team.find({ game: gameId });
      io.emit('team:joined', { team });
      socket.emit('teams:list', { teams });

      // Send current game state so client navigates correctly
      if (game) {
        socket.emit('game:state', {
          status: game.status,
          currentMode: game.currentMode,
          completedModes: game.completedModes,
        });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to join' });
    }
  });

  // Token-based reconnection - automatic, no user input needed
  socket.on('team:reconnect', async (data: { token: string }) => {
    try {
      const { token } = data;
      if (!token) {
        socket.emit('team:reconnect-failed', { reason: 'no-token' });
        return;
      }

      const team = await Team.findOne({ deviceToken: token });
      if (!team) {
        socket.emit('team:reconnect-failed', { reason: 'invalid-token' });
        return;
      }

      // Check game still exists
      const game = await Game.findById(team.game);
      if (!game) {
        socket.emit('team:reconnect-failed', { reason: 'no-game' });
        return;
      }

      // Cancel any pending disconnect timer
      cancelDisconnectTimer(team._id.toString());

      // Restore connection
      team.isConnected = true;
      team.socketId = socket.id;
      team.lastSeen = new Date();
      await team.save();

      socket.data.teamId = team._id.toString();
      socket.data.gameId = team.game.toString();

      const teams = await Team.find({ game: team.game });

      // Send full state to reconnected client
      socket.emit('team:reconnected', {
        team,
        game: {
          _id: game._id,
          status: game.status,
          currentMode: game.currentMode,
          completedModes: game.completedModes,
        },
        teams,
      });

      // If bingo is active, send the team's bingo card
      if (game.status === 'bingo') {
        const bingoCard = await BingoCard.findOne({ game: team.game, team: team._id }).populate('cells.song');
        if (bingoCard) {
          socket.emit('bingo:card', { card: bingoCard });
        }
      }

      // Notify others this team is back online
      io.emit('team:joined', { team });
    } catch (error) {
      socket.emit('team:reconnect-failed', { reason: 'error' });
    }
  });

  // Heartbeat - update lastSeen timestamp
  socket.on('team:heartbeat', async () => {
    try {
      if (socket.data.teamId) {
        await Team.findByIdAndUpdate(socket.data.teamId, { lastSeen: new Date() });
      }
    } catch {
      // Silent fail for heartbeat
    }
  });

  // Admin kicks a team
  socket.on('team:kick', async (data: { teamId: string; gameId: string }) => {
    try {
      const { teamId, gameId } = data;
      const team = await Team.findById(teamId);
      if (!team) return;

      cancelDisconnectTimer(teamId);

      // Disconnect the team's socket if connected
      if (team.socketId) {
        const teamSocket = io.sockets.sockets.get(team.socketId);
        if (teamSocket) {
          teamSocket.emit('team:kicked');
          teamSocket.disconnect(true);
        }
      }

      await Team.findByIdAndDelete(teamId);

      const teams = await Team.find({ game: gameId });
      io.emit('teams:list', { teams });
      io.emit('team:removed', { teamId });
    } catch (error) {
      socket.emit('error', { message: 'Failed to kick team' });
    }
  });

  socket.on('disconnect', async () => {
    try {
      const teamId = socket.data.teamId;
      if (!teamId) return;

      // Start grace period - don't mark as disconnected immediately
      const timer = setTimeout(async () => {
        try {
          const team = await Team.findById(teamId);
          // Only mark disconnected if still using the old socketId (not reconnected)
          if (team && team.socketId === socket.id) {
            team.isConnected = false;
            team.socketId = null;
            await team.save();
            io.emit('team:disconnected', { teamId });
          }
        } catch (error) {
          console.error('Grace period handler error:', error);
        } finally {
          disconnectTimers.delete(teamId);
        }
      }, DISCONNECT_GRACE_MS);

      disconnectTimers.set(teamId, timer);
    } catch (error) {
      console.error('Disconnect handler error:', error);
    }
  });
};

function cancelDisconnectTimer(teamId: string) {
  const timer = disconnectTimers.get(teamId);
  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(teamId);
  }
}
