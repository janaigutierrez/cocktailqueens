import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { Card } from '../ui/Card';
import { Cocktail } from '../../types';
import { GlassWater } from 'lucide-react';

export const Prova1View = () => {
  const { socket } = useSocket();
  const { myTeam } = useGame();
  const [assignment, setAssignment] = useState<{ name: string; ingredients: string[] } | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('prova1:assignment', (data: { cocktail: { name: string; ingredients: string[] } }) => {
      setAssignment(data.cocktail);
    });

    return () => {
      socket.off('prova1:assignment');
    };
  }, [socket]);

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <GlassWater className="text-pink-400 mb-4 animate-pulse" size={48} />
        <p className="text-gray-600 text-center">
          Esperant que l'admin assigni els coctels...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-pink-600">Prova 1: Recrea el coctel</h2>

      <Card className="text-center">
        <GlassWater className="mx-auto text-pink-500 mb-3" size={36} />
        <h3 className="text-xl font-bold mb-4">{assignment.name}</h3>

        <div>
          <p className="text-sm text-gray-500 mb-2">Ingredients:</p>
          <ul className="space-y-1">
            {assignment.ingredients.map((ing, i) => (
              <li key={i} className="bg-pink-50 rounded-lg px-3 py-1.5 text-pink-700">
                {ing}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <p className="text-sm text-gray-500 text-center">
        Recrea aquest coctel amb els ingredients indicats!
      </p>
    </div>
  );
};
