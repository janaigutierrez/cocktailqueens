import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Eye, CheckCircle } from 'lucide-react';

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
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-pink-600">Resultats Prova 3</h2>
        <Card className="text-center">
          <p className="text-3xl font-bold text-pink-600 mb-2">{results.score} punts</p>
        </Card>
        <div className="space-y-2">
          {results.correctAnswers.map((ca) => (
            <Card key={ca.number}>
              <div className="flex justify-between items-center">
                <span className="font-bold">Coctel #{ca.number}</span>
                <span className="text-green-600">{ca.correctName}</span>
              </div>
              {guesses[ca.number] && (
                <p className="text-sm text-gray-500 mt-1">
                  La teva resposta: {guesses[ca.number]}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckCircle className="text-green-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-pink-600 mb-2">Respostes enviades!</h2>
        <p className="text-gray-600">Esperant els resultats...</p>
      </div>
    );
  }

  if (cocktailNumbers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Eye className="text-pink-400 mb-4 animate-pulse" size={48} />
        <p className="text-gray-600 text-center">Esperant que l'admin prepari el tast a cegues...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-pink-600">Prova 3: Tast a cegues</h2>
      <p className="text-center text-gray-600">Endevina el nom de cada coctel!</p>

      <div className="space-y-3">
        {cocktailNumbers.map((num) => (
          <Card key={num}>
            <Input
              label={`Coctel #${num}`}
              value={guesses[num] || ''}
              onChange={(e) => setGuesses((prev) => ({ ...prev, [num]: e.target.value }))}
              placeholder="Nom del coctel..."
            />
          </Card>
        ))}
      </div>

      <Button onClick={handleSubmit} className="w-full" size="lg">
        Enviar respostes
      </Button>
    </div>
  );
};
