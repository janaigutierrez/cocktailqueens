import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Prova1View } from '../components/game/Prova1View';
import { Prova2View } from '../components/game/Prova2View';
import { Prova3View } from '../components/game/Prova3View';
import { BingoView } from '../components/game/BingoView';
import { RoundResults } from '../components/game/RoundResults';
import { Wine, Music } from 'lucide-react';

const statusLabels: Record<string, string> = {
  'cocktails-prova1': 'Prova 1',
  'cocktails-prova2': 'Prova 2',
  'cocktails-prova3': 'Prova 3',
  'cocktails-results': 'Resultats',
  'bingo': 'Bingo Musical',
  'bingo-results': 'Resultats Bingo',
};

export const GamePage = () => {
  const { game, myTeam, isReconnecting } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for reconnection to finish before redirecting
    if (isReconnecting) return;

    if (!myTeam) {
      navigate('/');
      return;
    }

    if (game?.status === 'lobby' || game?.status === 'lobby-intermedi') {
      navigate('/lobby');
    }

    if (game?.status === 'finished') {
      navigate('/ranking');
    }
  }, [game, myTeam, navigate, isReconnecting]);

  if (!game || !myTeam) return null;

  const isCocktails = game.status.startsWith('cocktails');
  const label = statusLabels[game.status] || '';

  const renderContent = () => {
    switch (game.status) {
      case 'cocktails-prova1':
        return <Prova1View />;
      case 'cocktails-prova2':
        return <Prova2View />;
      case 'cocktails-prova3':
        return <Prova3View />;
      case 'cocktails-results':
        return <RoundResults mode="cocktails" />;
      case 'bingo':
        return <BingoView />;
      case 'bingo-results':
        return <RoundResults mode="bingo" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-svh flex flex-col bg-festa">
      <header className="glass p-4 shadow-sm border-b border-rosa-100/50">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            {isCocktails ? (
              <Wine size={18} className="text-rosa-500" />
            ) : (
              <Music size={18} className="text-lila-500" />
            )}
            <span className="text-sm font-semibold text-rosa-400">{label}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-rosa-100 text-rosa-600 font-bold text-sm">
            {myTeam.name}
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 max-w-lg mx-auto w-full animate-fade-in">
        {renderContent()}
      </main>
    </div>
  );
};
