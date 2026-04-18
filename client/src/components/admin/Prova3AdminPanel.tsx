import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { ArrowRight, Eye } from 'lucide-react';

interface Props {
  onAdvance: () => void;
}

export const Prova3AdminPanel = ({ onAdvance }: Props) => {
  const { socket } = useSocket();
  const { game } = useGame();
  const [cocktails, setCocktails] = useState<Record<number, string>>({});
  const [setup, setSetup] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleSetup = () => {
    if (!socket || !game) return;
    const cocktailArray = [1, 2, 3, 4, 5, 6]
      .filter((n) => cocktails[n]?.trim())
      .map((n) => ({ number: n, correctName: cocktails[n].trim() }));

    if (cocktailArray.length === 0) return;

    socket.emit('prova3:start', { gameId: game._id, cocktails: cocktailArray });
    setSetup(true);
  };

  const handleReveal = () => {
    if (!socket || !game) return;
    socket.emit('prova3:reveal', { gameId: game._id });
    setRevealed(true);
  };

  if (revealed) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-pink-600 text-center">Resultats Prova 3</h2>
        <Card className="text-center">
          <p className="text-gray-600">Respostes revelades!</p>
        </Card>
        <Button onClick={onAdvance} className="w-full">
          Veure resultats coctels <ArrowRight size={16} className="inline ml-2" />
        </Button>
      </div>
    );
  }

  if (setup) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-pink-600 text-center">Prova 3: Tast a cegues</h2>
        <Card className="text-center">
          <p className="text-gray-600">Equips contestant... Quan estiguin tots:</p>
        </Card>
        <Button onClick={handleReveal} className="w-full" size="lg">
          <Eye size={20} className="inline mr-2" />
          Revelar respostes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-pink-600 text-center">Prova 3: Tast a cegues</h2>
      <p className="text-center text-gray-500 text-sm">Introdueix els noms correctes dels 6 coctels</p>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <Input
            key={num}
            label={`Coctel #${num}`}
            value={cocktails[num] || ''}
            onChange={(e) => setCocktails((prev) => ({ ...prev, [num]: e.target.value }))}
            placeholder="Nom del coctel..."
          />
        ))}
      </div>

      <Button onClick={handleSetup} className="w-full" size="lg">
        Iniciar tast a cegues
      </Button>
    </div>
  );
};
