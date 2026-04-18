import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { ArrowRight, Eye, FlaskConical, Sparkles, Trophy } from 'lucide-react';

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
      <div className="space-y-5 animate-fade-in text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 mb-2 shadow-lg animate-bounce-in">
          <Trophy className="text-white" size={28} />
        </div>
        <h2 className="text-xl font-extrabold text-gradient">Resultats Prova 3</h2>
        <Card>
          <div className="flex items-center justify-center gap-2 text-rosa-500">
            <Sparkles size={16} />
            <p className="font-medium">Respostes revelades!</p>
            <Sparkles size={16} />
          </div>
        </Card>
        <Button onClick={onAdvance} variant="gold" className="w-full" size="lg">
          Veure resultats coctels <ArrowRight size={16} className="inline ml-2" />
        </Button>
      </div>
    );
  }

  if (setup) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-rosa-400 to-lila-500 mb-3 shadow-lg">
            <FlaskConical className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-gradient">Prova 3: Tast a cegues</h2>
        </div>
        <Card>
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-rosa-400 mb-2">
              <Sparkles size={14} />
              <p className="font-medium">Equips contestant...</p>
              <Sparkles size={14} />
            </div>
            <p className="text-sm text-rosa-300">Quan tots hagin acabat, revela les respostes</p>
          </div>
        </Card>
        <Button onClick={handleReveal} className="w-full" size="lg">
          <Eye size={20} className="inline mr-2" />
          Revelar respostes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-rosa-400 to-lila-500 mb-3 shadow-lg">
          <FlaskConical className="text-white" size={24} />
        </div>
        <h2 className="text-xl font-extrabold text-gradient">Prova 3: Tast a cegues</h2>
        <p className="text-sm text-rosa-400 mt-1">Introdueix els noms correctes dels 6 coctels</p>
      </div>

      <div className="space-y-3 stagger">
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
