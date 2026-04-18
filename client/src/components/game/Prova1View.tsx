import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Card } from '../ui/Card';
import { GlassWater, Sparkles } from 'lucide-react';

export const Prova1View = () => {
  const { socket } = useSocket();
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
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-rosa-100 flex items-center justify-center mb-4 animate-pulse-glow">
          <GlassWater className="text-rosa-500" size={32} />
        </div>
        <p className="text-rosa-400 text-center text-lg">
          Esperant que l'admin assigni els coctels...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center">
        <Sparkles className="inline text-gold-400 mb-2" size={24} />
        <h2 className="text-2xl font-extrabold text-gradient">Recrea el coctel!</h2>
      </div>

      <Card className="text-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rosa-400 to-lila-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <GlassWater className="text-white" size={28} />
        </div>
        <h3 className="text-2xl font-extrabold text-rosa-600 mb-5">{assignment.name}</h3>

        <p className="text-sm font-semibold text-rosa-400 mb-3 uppercase tracking-wide">Ingredients</p>
        <div className="space-y-2">
          {assignment.ingredients.map((ing, i) => (
            <div
              key={i}
              className="bg-gradient-to-r from-rosa-50 to-lila-50 rounded-xl px-4 py-2.5 text-rosa-700 font-medium border border-rosa-100"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {ing}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
