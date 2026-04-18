import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { cocktailService } from '../../services/cocktailService';
import type { Cocktail } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, Plus, Trash2, Edit3 } from 'lucide-react';

export const AdminCocktailsPage = () => {
  const navigate = useNavigate();
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);

  useEffect(() => {
    if (!adminService.isLoggedIn()) {
      navigate('/admin');
      return;
    }
    loadCocktails();
  }, [navigate]);

  const loadCocktails = async () => {
    const data = await cocktailService.getAll();
    setCocktails(data);
  };

  const handleSave = async () => {
    const filtered = ingredients.filter((i) => i.trim());
    if (!name.trim() || filtered.length === 0) return;

    if (editingId) {
      await cocktailService.update(editingId, { name, ingredients: filtered });
    } else {
      await cocktailService.create({ name, ingredients: filtered });
    }

    closeModal();
    loadCocktails();
  };

  const handleEdit = (cocktail: Cocktail) => {
    setEditingId(cocktail._id);
    setName(cocktail.name);
    setIngredients(cocktail.ingredients.length > 0 ? cocktail.ingredients : ['']);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await cocktailService.delete(id);
    loadCocktails();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setIngredients(['']);
  };

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (idx: number) =>
    setIngredients(ingredients.filter((_, i) => i !== idx));
  const updateIngredient = (idx: number, val: string) =>
    setIngredients(ingredients.map((ing, i) => (i === idx ? val : ing)));

  return (
    <div className="min-h-svh bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center gap-3">
        <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-pink-600">Coctels</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <Button onClick={() => setIsModalOpen(true)} className="w-full mb-4">
          <Plus size={16} className="inline mr-2" />
          Afegir coctel
        </Button>

        <div className="space-y-3">
          {cocktails.map((cocktail) => (
            <Card key={cocktail._id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{cocktail.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cocktail.ingredients.map((ing, i) => (
                      <span key={i} className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(cocktail)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cocktail._id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {cocktails.length === 0 && (
            <p className="text-center text-gray-400 py-8">No hi ha coctels</p>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Editar coctel' : 'Nou coctel'}
      >
        <div className="space-y-4">
          <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mojito" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  value={ing}
                  onChange={(e) => updateIngredient(i, e.target.value)}
                  placeholder="Ingredient..."
                />
                {ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-600 px-2">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <Button onClick={addIngredient} variant="secondary" size="sm">
              <Plus size={14} className="inline mr-1" />
              Afegir
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={closeModal} variant="secondary" className="flex-1">
              Cancel·lar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
