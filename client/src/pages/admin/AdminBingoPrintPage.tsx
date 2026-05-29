import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { bingoService, type PrintableCell } from '../../services/bingoService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Printer, ArrowLeft, AlertCircle } from 'lucide-react';

const CellGrid = ({ cells }: { cells: PrintableCell[] }) => {
  const map = new Map<string, PrintableCell>();
  cells.forEach((c) => map.set(`${c.row}-${c.col}`, c));

  return (
    <div className="bingo-grid">
      {[0, 1, 2].map((row) => (
        <div key={row} className="bingo-row">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((col) => {
            const cell = map.get(`${row}-${col}`);
            return (
              <div
                key={col}
                className={`bingo-cell ${cell ? 'filled' : 'empty'}`}
              >
                {cell && (
                  <>
                    <div className="cell-title">{cell.title}</div>
                    <div className="cell-artist">{cell.artist}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const AdminBingoPrintPage = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(10);
  const [cards, setCards] = useState<PrintableCell[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminService.isLoggedIn()) navigate('/admin');
  }, [navigate]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await bingoService.generatePrintableCards(count);
      setCards(result);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Error generant cartons';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-svh bg-festa">
      <style>{`
        .bingo-grid { display: flex; flex-direction: column; gap: 2mm; }
        .bingo-row { display: grid; grid-template-columns: repeat(9, 1fr); gap: 1.5mm; }
        .bingo-cell {
          aspect-ratio: 3 / 4;
          border-radius: 2mm;
          padding: 1mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }
        .bingo-cell.filled {
          border: 1.5px solid #ec4899;
          background: #fff;
        }
        .bingo-cell.empty {
          background: #f3f4f6;
          border: 1px dashed #d1d5db;
        }
        .cell-title { font-weight: 700; font-size: 7pt; line-height: 1.1; color: #be185d; }
        .cell-artist { font-size: 6pt; line-height: 1.1; color: #9333ea; margin-top: 0.5mm; }
        .printable-card {
          width: 100%;
          padding: 6mm;
          background: white;
          box-sizing: border-box;
        }
        .printable-header { text-align: center; margin-bottom: 4mm; }
        .printable-title {
          font-size: 16pt;
          font-weight: 800;
          background: linear-gradient(90deg, #ec4899, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .printable-subtitle { font-size: 9pt; color: #9ca3af; margin-top: 1mm; }
        .printable-footer {
          margin-top: 4mm;
          text-align: center;
          font-size: 7pt;
          color: #9ca3af;
        }

        .printable-page {
          display: flex;
          flex-direction: column;
        }

        @media screen {
          .printable-page {
            max-width: 210mm;
            margin: 0 auto 8mm;
          }
          .printable-card {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 4mm;
            margin-bottom: 4mm;
          }
        }

        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .printable-page {
            width: 210mm;
            height: 297mm;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .printable-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .printable-card {
            width: 210mm;
            height: 148.5mm;
            box-shadow: none;
            border-radius: 0;
            margin: 0;
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      <header className="glass p-4 shadow-sm border-b border-rosa-100/50 no-print">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <Link to="/admin/dashboard" className="p-2 hover:bg-rosa-100 rounded-xl transition-colors">
              <ArrowLeft size={18} className="text-rosa-500" />
            </Link>
            <h1 className="font-extrabold text-gradient">Cartons imprimibles</h1>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-3xl mx-auto">
        <Card className="mb-4 no-print">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-rosa-500 block mb-1">
                Quants cartons vols generar?
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-full px-4 py-3 rounded-2xl border-2 border-rosa-200 focus:border-rosa-400 focus:outline-none bg-white text-rosa-700 font-medium"
              />
              <p className="text-xs text-rosa-400 mt-1">2 cartons (A5) per pagina A4. Al dialeg d'imprimir, desmarca "Capcaleres i peus de pagina" / "Headers and footers" per veure el full net.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={loading} className="flex-1">
                {loading ? 'Generant...' : 'Generar'}
              </Button>
              {cards.length > 0 && (
                <Button onClick={handlePrint} variant="gold" className="flex-1">
                  <Printer size={16} className="inline mr-2" />
                  Imprimir
                </Button>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>
        </Card>

        {cards.length === 0 && !loading && (
          <p className="text-center text-rosa-400 mt-8 no-print">
            Genera cartons per veure'ls aqui.
          </p>
        )}

        {Array.from({ length: Math.ceil(cards.length / 2) }).map((_, pageIdx) => (
          <div key={pageIdx} className="printable-page">
            {cards.slice(pageIdx * 2, pageIdx * 2 + 2).map((cells, slot) => {
              const i = pageIdx * 2 + slot;
              return (
                <div key={i} className="printable-card">
                  <div className="printable-header">
                    <div className="printable-title">Bingo Musical</div>
                    <div className="printable-subtitle">Carto #{i + 1}</div>
                  </div>
                  <CellGrid cells={cells} />
                  <div className="printable-footer">
                    Marca les cancons que sonin. 5 en linia = LINIA. Tot el carto = BINGO!
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </main>
    </div>
  );
};
