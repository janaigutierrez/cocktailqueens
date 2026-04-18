import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { songService } from '../../services/songService';
import type { Song } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, Plus, Trash2, Edit3, Upload, Music } from 'lucide-react';

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
    if (!adminService.isLoggedIn()) { navigate('/admin'); return; }
    loadSongs();
  }, [navigate]);

  const loadSongs = async () => { setSongs(await songService.getAll()); };

  const handleSave = async () => {
    if (!title.trim() || !artist.trim()) return;
    if (editingId) { await songService.update(editingId, { title, artist }); }
    else { await songService.create({ title, artist }); }
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
    setEditingId(song._id); setTitle(song.title); setArtist(song.artist); setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => { await songService.delete(id); loadSongs(); };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setTitle(''); setArtist(''); };

  return (
    <div className="min-h-svh bg-festa">
      <header className="glass p-4 shadow-sm border-b border-rosa-100/50">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link to="/admin/dashboard" className="p-2 hover:bg-rosa-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-rosa-500" />
          </Link>
          <Music size={20} className="text-lila-500" />
          <h1 className="font-bold text-rosa-600">Cancons ({songs.length})</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <div className="flex gap-2 mb-5">
          <Button onClick={() => setIsModalOpen(true)} className="flex-1" size="lg">
            <Plus size={16} className="inline mr-2" /> Afegir
          </Button>
          <Button onClick={() => setIsBulkOpen(true)} variant="secondary" className="flex-1" size="lg">
            <Upload size={16} className="inline mr-2" /> Import massiu
          </Button>
        </div>

        <div className="space-y-2 stagger">
          {songs.map((song) => (
            <Card key={song._id}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-rosa-600 truncate">{song.title}</p>
                  <p className="text-sm text-rosa-400 truncate">{song.artist}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => handleEdit(song)} className="p-2 hover:bg-rosa-50 rounded-xl transition-colors">
                    <Edit3 size={16} className="text-rosa-400" />
                  </button>
                  <button onClick={() => handleDelete(song._id)} className="p-2 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {songs.length === 0 && (
            <p className="text-center text-rosa-300 py-12">No hi ha cancons</p>
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
          <p className="text-sm text-rosa-400">Una canco per linia: <code className="bg-rosa-50 px-1.5 py-0.5 rounded text-rosa-600">Titol - Artista</code></p>
          <textarea
            className="w-full px-4 py-3 rounded-2xl border border-rosa-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-rosa-400 resize-none placeholder:text-rosa-300"
            rows={8}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"Despacito - Luis Fonsi\nWaka Waka - Shakira\nBad Guy - Billie Eilish"}
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
