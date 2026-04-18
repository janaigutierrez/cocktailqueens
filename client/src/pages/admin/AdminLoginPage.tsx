import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield } from 'lucide-react';

export const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError('');

    try {
      await adminService.login(password);
      navigate('/admin/dashboard');
    } catch {
      setError('Contrasenya incorrecta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6 bg-festa">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rosa-400 to-lila-500 mb-4 shadow-lg">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-gradient">Admin Panel</h1>
        </div>

        <div className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contrasenya admin"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}

          <Button onClick={handleLogin} disabled={loading || !password.trim()} className="w-full" size="lg">
            {loading ? 'Entrant...' : 'Entrar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
