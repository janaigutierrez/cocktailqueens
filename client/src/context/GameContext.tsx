import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { Game, GameStatus, GameMode, Team } from '../types';
import { gameService } from '../services/gameService';

interface GameContextType {
  game: Game | null;
  teams: Team[];
  myTeam: Team | null;
  setMyTeam: (team: Team | null) => void;
  refreshGame: () => Promise<void>;
}

const GameContext = createContext<GameContextType>({
  game: null,
  teams: [],
  myTeam: null,
  setMyTeam: () => {},
  refreshGame: async () => {},
});

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { socket } = useSocket();
  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);

  const refreshGame = useCallback(async () => {
    try {
      const data = await gameService.get();
      setGame(data);
    } catch {
      // No game exists yet
    }
  }, []);

  useEffect(() => {
    refreshGame();
  }, [refreshGame]);

  useEffect(() => {
    if (!socket) return;

    socket.on('game:phase-change', (data: { status: GameStatus; currentMode: GameMode | null }) => {
      setGame((prev) => (prev ? { ...prev, status: data.status, currentMode: data.currentMode } : prev));
    });

    socket.on('team:joined', (data: { team: Team }) => {
      setTeams((prev) => {
        const exists = prev.find((t) => t._id === data.team._id);
        if (exists) return prev.map((t) => (t._id === data.team._id ? data.team : t));
        return [...prev, data.team];
      });
    });

    socket.on('teams:list', (data: { teams: Team[] }) => {
      setTeams(data.teams);
    });

    socket.on('team:disconnected', (data: { teamId: string }) => {
      setTeams((prev) =>
        prev.map((t) => (t._id === data.teamId ? { ...t, isConnected: false } : t))
      );
    });

    socket.on('ranking:update', (data: { rankings: Team[] }) => {
      setTeams(data.rankings);
    });

    socket.on('lobby:reopen', () => {
      refreshGame();
    });

    return () => {
      socket.off('game:phase-change');
      socket.off('team:joined');
      socket.off('teams:list');
      socket.off('team:disconnected');
      socket.off('ranking:update');
      socket.off('lobby:reopen');
    };
  }, [socket, refreshGame]);

  return (
    <GameContext.Provider value={{ game, teams, myTeam, setMyTeam, refreshGame }}>
      {children}
    </GameContext.Provider>
  );
};
