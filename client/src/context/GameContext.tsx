import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useSocket } from './SocketContext';
import type { Game, GameStatus, GameMode, Team } from '../types';
import { gameService } from '../services/gameService';

const TOKEN_KEY = 'cq-device-token';

interface GameContextType {
  game: Game | null;
  teams: Team[];
  myTeam: Team | null;
  setMyTeam: (team: Team | null) => void;
  refreshGame: () => Promise<void>;
  isReconnecting: boolean;
}

const GameContext = createContext<GameContextType>({
  game: null,
  teams: [],
  myTeam: null,
  setMyTeam: () => {},
  refreshGame: async () => {},
  isReconnecting: false,
});

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { socket, isConnected } = useSocket();
  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptedRef = useRef(false);

  const refreshGame = useCallback(async () => {
    try {
      const data = await gameService.get();
      setGame(data);
    } catch {
      setGame(null);
    }
  }, []);

  useEffect(() => {
    refreshGame();
  }, [refreshGame]);

  // Auto-reconnect with stored token when socket connects
  useEffect(() => {
    if (!socket || !isConnected) {
      reconnectAttemptedRef.current = false;
      return;
    }

    // Don't reconnect if already have a team or already attempted
    if (myTeam || reconnectAttemptedRef.current) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    reconnectAttemptedRef.current = true;
    setIsReconnecting(true);
    socket.emit('team:reconnect', { token });
  }, [socket, isConnected, myTeam]);

  // Heartbeat every 15 seconds
  useEffect(() => {
    if (!socket || !myTeam) {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      return;
    }

    heartbeatRef.current = setInterval(() => {
      socket.emit('team:heartbeat');
    }, 15_000);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [socket, myTeam]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('game:phase-change', (data: { status: GameStatus; currentMode: GameMode | null }) => {
      setGame((prev) => (prev ? { ...prev, status: data.status, currentMode: data.currentMode } : prev));
    });

    // Store token when joining
    socket.on('team:token', (data: { token: string; team: Team }) => {
      localStorage.setItem(TOKEN_KEY, data.token);
      setMyTeam(data.team);
    });

    // Successful reconnection - restore full state
    socket.on('team:reconnected', (data: { team: Team; game: { _id: string; status: GameStatus; currentMode: GameMode | null; completedModes: GameMode[] }; teams: Team[] }) => {
      setMyTeam(data.team);
      setGame((prev) => prev ? { ...prev, ...data.game } : { ...data.game } as Game);
      setTeams(data.teams);
      setIsReconnecting(false);
      refreshGame(); // Full refresh for complete game data
    });

    // Reconnect failed - clear token, let user rejoin
    socket.on('team:reconnect-failed', () => {
      localStorage.removeItem(TOKEN_KEY);
      setIsReconnecting(false);
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

    socket.on('game:reset', () => {
      localStorage.removeItem(TOKEN_KEY);
      setTeams([]);
      setMyTeam(null);
      refreshGame();
    });

    socket.on('team:kicked', () => {
      localStorage.removeItem(TOKEN_KEY);
      setMyTeam(null);
    });

    socket.on('team:removed', (data: { teamId: string }) => {
      setTeams((prev) => prev.filter((t) => t._id !== data.teamId));
      setMyTeam((prev) => {
        if (prev && prev._id === data.teamId) {
          localStorage.removeItem(TOKEN_KEY);
          return null;
        }
        return prev;
      });
    });

    return () => {
      socket.off('game:phase-change');
      socket.off('team:token');
      socket.off('team:reconnected');
      socket.off('team:reconnect-failed');
      socket.off('team:joined');
      socket.off('teams:list');
      socket.off('team:disconnected');
      socket.off('ranking:update');
      socket.off('lobby:reopen');
      socket.off('game:reset');
      socket.off('team:kicked');
      socket.off('team:removed');
    };
  }, [socket, refreshGame]);

  return (
    <GameContext.Provider value={{ game, teams, myTeam, setMyTeam, refreshGame, isReconnecting }}>
      {children}
    </GameContext.Provider>
  );
};
