import { useState, useRef } from 'react';
import useAxiosPrivate from '../api/useAxiosPrivate';
import { postPredictBatch } from '../api/predictionApi';
import { Layout } from '../components/Layout';
import { MdUploadFile, MdDownload, MdClose } from 'react-icons/md';
import { Spinner } from '../components/Spinner';

const CLASS_BADGE = {
  Rebut:       'bg-red-100 text-red-700',
  Acceptable:  'bg-orange-100 text-orange-700',
  Cible:       'bg-green-100 text-green-700',
  Inefficient: 'bg-yellow-100 text-yellow-700',
};

const CLASS_STYLE = {
  Rebut:       { color: '#ef4444', bg: '#fef2f2' },
  Acceptable:  { color: '#f97316', bg: '#fff7ed' },
  Cible:       { color: '#22c55e', bg: '#f0fdf4' },
  Inefficient: { color: '#eab308', bg: '#fefce8' },
};

export const BatchPrediction = () => {
  const axios = useAxiosPrivate();
  const fileRef = useRef(null);
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [drag, setDrag]       = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) { setError('Format CSV uniquement.'); return; }
    setFile(f); setError(''); setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Veuillez sélectionner un fichier CSV.'); return; }
    setLoading(true); setError('');
    try {
      const res = await postPredictBatch(axios, file);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Erreur lors du traitement.');
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    if (!result) return;
    const header = ['Ligne', 'Classe', 'Rebut%', 'Acceptable%', 'Cible%', 'Inefficient%'];
    const rows = result.results.map(r => [
      r.row, r.className,
      Math.round((r.probabilities?.['1'] || 0) * 100),
      Math.round((r.probabilities?.['2'] || 0) * 100),
      Math.round((r.probabilities?.['3'] || 0) * 100),
      Math.round((r.probabilities?.['4'] || 0) * 100),
    ]);
    const csv  = [header, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'predictions_lot.csv'; a.click();
  };

  const summary = result
    ? result.results.reduce((acc, r) => { acc[r.className] = (acc[r.className] || 0) + 1; return acc; }, {})
    : {};

  return (
    <Layout title="Prédiction par lot (CSV)">

      {/* Upload zone */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-6 shadow-sm">
        <h2 className="font-semibold text-slate-700 text-sm sm:text-base mb-1 flex items-center gap-2">
          <MdUploadFile className="text-blue-500 text-lg" />
          Importer un fichier CSV
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Le fichier doit contenir les 13 colonnes au format semicolon (;) — colonnes du dataset iGuzzini.
        </p>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            drag
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <MdUploadFile className={`text-5xl mx-auto mb-3 transition-colors ${drag ? 'text-blue-400' : 'text-slate-300'}`} />
          {file ? (
            <div>
              <p className="text-sm font-semibold text-blue-600">{file.name}</p>
              <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-500">Glissez le fichier ici</p>
              <p className="text-xs text-slate-400 mt-1">ou cliquez pour sélectionner</p>
            </>
          )}
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>

        {/* Clear file */}
        {file && (
          <button
            onClick={() => { setFile(null); setResult(null); setError(''); }}
            className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
          >
            <MdClose className="text-sm" /> Supprimer le fichier
          </button>
        )}

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                       text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm shadow-sm shadow-blue-200"
          >
            {loading ? <><Spinner size="sm" /><span>Traitement en cours…</span></> : '▶ Lancer la prédiction'}
          </button>
          {result && (
            <button
              onClick={downloadResults}
              className="flex items-center justify-center gap-2 border border-blue-300 text-blue-600 hover:bg-blue-50
                         font-medium px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <MdDownload className="text-base" /> Télécharger les résultats
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {['Rebut', 'Acceptable', 'Cible', 'Inefficient'].map(cls => {
              const s = CLASS_STYLE[cls];
              const count = summary[cls] || 0;
              const pct = result.total > 0 ? Math.round((count / result.total) * 100) : 0;
              return (
                <div
                  key={cls}
                  className="rounded-2xl border p-4 text-center shadow-sm"
                  style={{ background: s.bg, borderColor: s.color + '40' }}
                >
                  <p className="text-xs text-slate-500 mb-1">{cls}</p>
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{count}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{pct}%</p>
                </div>
              );
            })}
          </div>

          {/* Results table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700 text-sm">{result.total} prédictions</h3>
            </div>

            {/* Mobile: card list */}
            <div className="block md:hidden divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {result.results.map(r => (
                <div key={r.row} className="px-4 py-3 flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-8 shrink-0">#{r.row}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${CLASS_BADGE[r.className] || 'bg-slate-100 text-slate-600'}`}>
                    {r.className}
                  </span>
                  <div className="grid grid-cols-4 gap-1 flex-1 text-[10px]">
                    {[
                      { label: 'R', val: r.probabilities?.['1'] },
                      { label: 'A', val: r.probabilities?.['2'] },
                      { label: 'C', val: r.probabilities?.['3'] },
                      { label: 'I', val: r.probabilities?.['4'] },
                    ].map(({ label, val }) => (
                      <div key={label} className="text-center">
                        <span className="text-slate-400">{label}: </span>
                        <span className="font-medium">{Math.round((val || 0) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Ligne</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Classe</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-medium">Rebut</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-medium">Acceptable</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-medium">Cible</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-medium">Inefficient</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map(r => (
                    <tr key={r.row} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 text-slate-400">{r.row}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CLASS_BADGE[r.className] || 'bg-slate-100 text-slate-600'}`}>
                          {r.className}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{Math.round((r.probabilities?.['1'] || 0) * 100)}%</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{Math.round((r.probabilities?.['2'] || 0) * 100)}%</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{Math.round((r.probabilities?.['3'] || 0) * 100)}%</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{Math.round((r.probabilities?.['4'] || 0) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};
