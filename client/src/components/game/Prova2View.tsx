import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Sparkles, Heart, Send } from 'lucide-react';

export const Prova2View = () => {
  const { socket } = useSocket();
  const { game, myTeam } = useGame();
  const [cocktailName, setCocktailName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!socket || !game || !myTeam || !cocktailName.trim()) return;
    socket.emit('prova2:submit', {
      teamId: myTeam._id,
      gameId: game._id,
      cocktailName: cocktailName.trim(),
      description: description.trim(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-bounce-in">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rosa-400 to-lila-500 flex items-center justify-center mb-4 shadow-lg">
          <Sparkles className="text-white" size={28} />
        </div>
        <h2 className="text-xl font-bold text-rosa-600 mb-2">Enviat!</h2>
        <p className="text-rosa-400 text-center">Esperant la puntuacio de l'admin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center">
        <Heart className="inline text-rosa-400 mb-2" size={24} />
        <h2 className="text-2xl font-extrabold text-gradient">Coctel Raquel</h2>
        <p className="text-rosa-400 mt-1">Crea un coctel inspirat en la Raquel!</p>
      </div>

      <Card>
        <div className="space-y-4">
          <Input
            label="Nom del coctel"
            value={cocktailName}
            onChange={(e) => setCocktailName(e.target.value)}
            placeholder="Ex: Sunset Raquel"
          />

          <div>
            <label className="block text-sm font-semibold text-rosa-600 mb-1.5">Descripcio</label>
            <textarea
              className="w-full px-4 py-3 rounded-2xl border border-rosa-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-rosa-400 focus:border-transparent resize-none placeholder:text-rosa-300 transition-all"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descriu el teu coctel..."
            />
          </div>

          <Button onClick={handleSubmit} disabled={!cocktailName.trim()} className="w-full" size="lg">
            <Send size={18} className="inline mr-2" />
            Enviar
          </Button>
        </div>
      </Card>
    </div>
  );
};
