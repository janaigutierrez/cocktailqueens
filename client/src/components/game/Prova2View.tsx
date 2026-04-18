import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Sparkles } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center py-12">
        <Sparkles className="text-pink-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-pink-600 mb-2">Enviat!</h2>
        <p className="text-gray-600 text-center">Esperant la puntuacio de l'admin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-pink-600">Prova 2: Coctel Raquel</h2>
      <p className="text-center text-gray-600">Crea un coctel inspirat en la Raquel!</p>

      <Card>
        <div className="space-y-4">
          <Input
            label="Nom del coctel"
            value={cocktailName}
            onChange={(e) => setCocktailName(e.target.value)}
            placeholder="Ex: Sunset Raquel"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcio</label>
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descriu el teu coctel..."
            />
          </div>

          <Button onClick={handleSubmit} disabled={!cocktailName.trim()} className="w-full">
            Enviar
          </Button>
        </div>
      </Card>
    </div>
  );
};
