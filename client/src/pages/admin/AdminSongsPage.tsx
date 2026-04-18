import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { songService } from '../../services/songService';
import { Song } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, Plus, Trash2, Edit3, Upload } from 'lucide-react';

export const AdminSongsPage = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [bulkText, setBulkText] = useState('');

  useEffect(() => {
    if (!adminService.isLoggedIn()) {
      navigate('/admin');
      return;
    }
    loadSongs();
  }, [navigate]);

  const loadSongs = async () => {
    const data = await songService.getAll();
    setSongs(data);
  };

  const handleSave = async () => {
    if (!title.trim() || !artist.trim()) return;

    if (editingId) {
      await songService.update(editingId, { title, artist });
    } else {
      await songService.create({ title, artist });
    }

    closeModal();
    loadSongs();
  };

  const handleBulkImport = async () => {
    const lines = bulkText.split('\n').filter((l) => l.trim());
    const parsed = lines.map((line) => {
      const [t, a] = line.split(' - ').map((s) => s.trim());
      return { title: t || line.trim(), artist: a || 'Desconegut' };
    });

    if (parsed.length === 0) return;
    await songService.bulkCreate(parsed);
    setIsBulkOpen(false);
    setBulkText('');
    loadSongs();
  };

  const handleEdit = (song: Song) => {
    setEditingId(song._id);
    setTitle(song.title);
    setArtist(song.artist);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await songService.delete(id);
    loadSongs();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setTitle('');
    setArtist('');
  };

  return (
    <div className="min-h-svh bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center gap-3">
        <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-pink-600">Cancons ({songs.length})</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <div className="flex gap-2 mb-4">
          <Button onClick={() => setIsModalOpen(true)} className="flex-1">
            <Plus size={16} className="inline mr-2" />
            Afegir
          </Button>
          <Button onClick={() => setIsBulkOpen(true)} variant="secondary" className="flex-1">
            <Upload size={16} className="inline mr-2" />
            Import massiu
          </Button>
        </div>

        <div className="space-y-2">
          {songs.map((song) => (
            <Card key={song._id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-gray-500">{song.artist}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(song)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(song._id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {songs.length === 0 && (
            <p className="text-center text-gray-400 py-8">No hi ha cancons</p>
          )}
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Editar canco' : 'Nova canco'}>
        <div className="space-y-4">
          <Input label="Titol" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Despacito" />
          <Input label="Artista" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Luis Fonsi" />
          <div className="flex gap-2 pt-2">
            <Button onClick={closeModal} variant="secondary" className="flex-1">Cancel·lar</Button>
            <Button onClick={handleSave} className="flex-1">Guardar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} title="Import massiu">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Una canco per linia, format: <code>Titol - Artista</code></p>
          <textarea
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            rows={8}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"Despacito - Luis Fonsi\nShapira - Shakira\nBad Guy - Billie Eilish"}
          />
          <div className="flex gap-2">
            <Button onClick={() => setIsBulkOpen(false)} variant="secondary" className="flex-1">Cancel·lar</Button>
            <Button onClick={handleBulkImport} className="flex-1">Importar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
