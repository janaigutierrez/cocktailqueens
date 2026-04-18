import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Eye, CheckCircle, Send } from 'lucide-react';

export const Prova3View = () => {
  const { socket } = useSocket();
  const { game, myTeam } = useGame();
  const [guesses, setGuesses] = useState<Record<number, string>>({});
  const [cocktailNumbers, setCocktailNumbers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{
    correctAnswers: { number: number; correctName: string }[];
    score: number;
  } | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('prova3:open', (data: { cocktailNumbers: number[] }) => {
      setCocktailNumbers(data.cocktailNumbers);
    });

    socket.on('prova3:results', (data: any) => {
      const myResult = data.teamResults?.find((r: any) => r.teamId === myTeam?._id);
      setResults({
        correctAnswers: data.correctAnswers,
        score: myResult?.score || 0,
      });
    });

    return () => {
      socket.off('prova3:open');
      socket.off('prova3:results');
    };
  }, [socket, myTeam]);

  const handleSubmit = () => {
    if (!socket || !game || !myTeam) return;
    const guessArray = cocktailNumbers.map((num) => ({
      number: num,
      guessedName: guesses[num] || '',
    }));
    socket.emit('prova3:submit', { teamId: myTeam._id, gameId: game._id, guesses: guessArray });
    setSubmitted(true);
  };

  if (results) {
    return (
      <div className="space-y-4 animate-slide-up">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gradient">Resultats Prova 3</h2>
        </div>
        <Card className="text-center animate-bounce-in">
          <p className="text-4xl font-extrabold text-gradient mb-1">{results.score}</p>
          <p className="text-rosa-400">punts</p>
        </Card>
        <div className="space-y-2 stagger">
          {results.correctAnswers.map((ca) => {
            const myGuess = guesses[ca.number]?.trim().toLowerCase();
            const correct = myGuess === ca.correctName.trim().toLowerCase();
            return (
              <Card key={ca.number}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-rosa-100 flex items-center justify-center text-sm font-bold text-rosa-500">
                      {ca.number}
                    </span>
                    <span className="font-bold text-rosa-600">{ca.correctName}</span>
                  </div>
                  {correct && <CheckCircle size={20} className="text-green-500" />}
                </div>
                {guesses[ca.number] && (
                  <p className={`text-sm mt-1 ml-10 ${correct ? 'text-green-500' : 'text-gray-400 line-through'}`}>
                    {guesses[ca.number]}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-bounce-in">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mb-4 shadow-lg">
          <CheckCircle className="text-white" size={28} />
        </div>
        <h2 className="text-xl font-bold text-rosa-600 mb-2">Respostes enviades!</h2>
        <p className="text-rosa-400">Esperant els resultats...</p>
      </div>
    );
  }

  if (cocktailNumbers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-rosa-100 flex items-center justify-center mb-4 animate-pulse-glow">
          <Eye className="text-rosa-500" size={32} />
        </div>
        <p className="text-rosa-400 text-center text-lg">Esperant que l'admin prepari el tast...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center">
        <Eye className="inline text-lila-400 mb-2" size={24} />
        <h2 className="text-2xl font-extrabold text-gradient">Tast a cegues</h2>
        <p className="text-rosa-400 mt-1">Endevina el nom de cada coctel!</p>
      </div>

      <div className="space-y-3 stagger">
        {cocktailNumbers.map((num) => (
          <Card key={num}>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-rosa-400 to-lila-500 flex items-center justify-center text-white font-bold shrink-0">
                {num}
              </span>
              <Input
                value={guesses[num] || ''}
                onChange={(e) => setGuesses((prev) => ({ ...prev, [num]: e.target.value }))}
                placeholder="Nom del coctel..."
              />
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={handleSubmit} className="w-full" size="lg">
        <Send size={18} className="inline mr-2" />
        Enviar respostes
      </Button>
    </div>
  );
};
