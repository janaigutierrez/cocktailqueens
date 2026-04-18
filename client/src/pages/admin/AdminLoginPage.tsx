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
    <div className="min-h-svh flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Shield className="mx-auto mb-4 text-pink-500" size={48} />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        <div className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contrasenya admin"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button onClick={handleLogin} disabled={loading || !password.trim()} className="w-full">
            {loading ? 'Entrant...' : 'Entrar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
