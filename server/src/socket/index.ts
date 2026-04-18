import { Server, Socket } from 'socket.io';
import { registerLobbyHandlers } from './lobbyHandlers';
import { registerGameHandlers } from './gameHandlers';
import { registerProva1Handlers } from './prova1Handlers';
import { registerProva2Handlers } from './prova2Handlers';
import { registerProva3Handlers } from './prova3Handlers';
import { registerBingoHandlers } from './bingoHandlers';

export const initializeSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    registerLobbyHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerProva1Handlers(io, socket);
    registerProva2Handlers(io, socket);
    registerProva3Handlers(io, socket);
    registerBingoHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
