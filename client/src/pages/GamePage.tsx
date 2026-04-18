import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Prova1View } from '../components/game/Prova1View';
import { Prova2View } from '../components/game/Prova2View';
import { Prova3View } from '../components/game/Prova3View';
import { BingoView } from '../components/game/BingoView';
import { RoundResults } from '../components/game/RoundResults';

export const GamePage = () => {
  const { game, myTeam } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
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
  }, [game, myTeam, navigate]);

  if (!game || !myTeam) return null;

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
        return <p className="text-center text-gray-500">Esperant...</p>;
    }
  };

  return (
    <div className="min-h-svh flex flex-col bg-gradient-to-b from-pink-100 to-purple-100">
      <header className="bg-white/80 backdrop-blur-sm p-4 text-center shadow-sm">
        <p className="text-sm text-gray-500">Equip</p>
        <p className="font-bold text-pink-600">{myTeam.name}</p>
      </header>
      <main className="flex-1 p-4">{renderContent()}</main>
    </div>
  );
};
