import { useState, useRef } from 'react';
import useAxiosPrivate from '../api/useAxiosPrivate';
import { postPredictBatch } from '../api/predictionApi';
import { Layout } from '../components/Layout';
import { MdUploadFile, MdDownload, MdCheckCircle, MdInfo, MdClose } from 'react-icons/md';

const CLASS_BADGE = {
  Rebut: 'bg-red-100 text-red-700', Acceptable: 'bg-orange-100 text-orange-700',
  Cible: 'bg-green-100 text-green-700', Inefficient: 'bg-yellow-100 text-yellow-700',
};

const SUMMARY_COLORS = { Rebut: 'text-red-600', Acceptable: 'text-orange-600', Cible: 'text-green-600', Inefficient: 'text-yellow-600' };

export const BatchPrediction = () => {
  const axios = useAxiosPrivate();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const f = e.target.files[0];
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
    const csv = [header, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'predictions_lot.csv'; a.click();
  };

  // Summary
  const summary = result
    ? result.results.reduce((acc, r) => { acc[r.className] = (acc[r.className] || 0) + 1; return acc; }, {})
    : {};

  return (
    <Layout title="Prédiction par lot (CSV)">
      {/* Upload zone */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <MdUploadFile className="text-blue-500 text-xl" />
          Importer un fichier CSV
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Le fichier doit contenir les 13 colonnes du dataset au format semicolon (;).
          Les colonnes attendues sont celles du dataset original iGuzzini.
        </p>

        <div
          className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
        >
          <MdUploadFile className="text-4xl text-slate-300 mx-auto mb-2" />
          {file ? (
            <p className="text-sm font-medium text-blue-600">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          ) : (
            <p className="text-sm text-slate-400">Glissez le fichier ici ou cliquez pour sélectionner</p>
          )}
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </div>

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                       text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? '⏳ Traitement en cours…' : '▶ Lancer la prédiction'}
          </button>
          {result && (
            <button
              onClick={downloadResults}
              className="flex items-center gap-2 border border-blue-300 text-blue-600 hover:bg-blue-50
                         font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              <MdDownload /> Télécharger les résultats
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {['Rebut', 'Acceptable', 'Cible', 'Inefficient'].map(cls => (
              <div key={cls} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">{cls}</p>
                <p className={`text-2xl font-bold ${SUMMARY_COLORS[cls]}`}>{summary[cls] || 0}</p>
                <p className="text-xs text-slate-400">
                  {result.total > 0 ? `${Math.round(((summary[cls] || 0) / result.total) * 100)}%` : '—'}
                </p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between">
              <h3 className="font-medium text-slate-700">{result.total} prédictions</h3>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
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
                    <tr key={r.row} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500">{r.row}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CLASS_BADGE[r.className] || 'bg-slate-100 text-slate-600'}`}>
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
