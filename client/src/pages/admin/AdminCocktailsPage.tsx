import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { cocktailService } from '../../services/cocktailService';
import type { Cocktail } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, Plus, Trash2, Edit3, Wine, AlertCircle } from 'lucide-react';

export const AdminCocktailsPage = () => {
  const navigate = useNavigate();
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!adminService.isLoggedIn()) { navigate('/admin'); return; }
    loadCocktails();
  }, [navigate]);

  const loadCocktails = async () => {
    try {
      const data = await cocktailService.getAll();
      setCocktails(data);
    } catch {
      setError('Error carregant coctels. Comprova la connexio.');
    }
  };

  const handleSave = async () => {
    const filtered = ingredients.filter((i) => i.trim());
    if (!name.trim() || filtered.length === 0) return;
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await cocktailService.update(editingId, { name, ingredients: filtered });
      } else {
        await cocktailService.create({ name, ingredients: filtered });
      }
      closeModal();
      await loadCocktails();
    } catch {
      setError('Error guardant el coctel. Comprova la connexio.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cocktail: Cocktail) => {
    setEditingId(cocktail._id);
    setName(cocktail.name);
    setIngredients(cocktail.ingredients.length > 0 ? cocktail.ingredients : ['']);
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await cocktailService.delete(id);
      await loadCocktails();
    } catch {
      setError('Error esborrant el coctel');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setIngredients(['']);
    setError('');
  };

  return (
    <div className="min-h-svh bg-festa">
      <header className="glass p-4 shadow-sm border-b border-rosa-100/50">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link to="/admin/dashboard" className="p-2 hover:bg-rosa-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-rosa-500" />
          </Link>
          <Wine size={20} className="text-rosa-500" />
          <h1 className="font-bold text-rosa-600">Coctels ({cocktails.length})</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <Button onClick={() => { setError(''); setIsModalOpen(true); }} className="w-full mb-5" size="lg">
          <Plus size={18} className="inline mr-2" />
          Afegir coctel
        </Button>

        <div className="space-y-3 stagger">
          {cocktails.map((cocktail) => (
            <Card key={cocktail._id}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-rosa-600">{cocktail.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cocktail.ingredients.map((ing, i) => (
                      <span key={i} className="text-xs bg-gradient-to-r from-rosa-50 to-lila-50 text-rosa-600 px-2.5 py-1 rounded-full border border-rosa-100 font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => handleEdit(cocktail)} className="p-2 hover:bg-rosa-50 rounded-xl transition-colors">
                    <Edit3 size={16} className="text-rosa-400" />
                  </button>
                  <button onClick={() => handleDelete(cocktail._id)} className="p-2 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {cocktails.length === 0 && (
            <p className="text-center text-rosa-300 py-12">No hi ha coctels</p>
          )}
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Editar coctel' : 'Nou coctel'}>
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}
          <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mojito" />
          <div>
            <label className="block text-sm font-semibold text-rosa-600 mb-2">Ingredients</label>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input value={ing} onChange={(e) => setIngredients(ingredients.map((x, j) => j === i ? e.target.value : x))} placeholder="Ingredient..." />
                {ingredients.length > 1 && (
                  <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-2">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <Button onClick={() => setIngredients([...ingredients, ''])} variant="secondary" size="sm">
              <Plus size={14} className="inline mr-1" /> Afegir
            </Button>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={closeModal} variant="secondary" className="flex-1">Cancel·lar</Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? 'Guardant...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
