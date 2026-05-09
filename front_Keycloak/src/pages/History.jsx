import { useEffect, useState } from 'react';
import useAxiosPrivate from '../api/useAxiosPrivate';
import { getHistory, getAllPredictions } from '../api/predictionApi';
import { useRole } from '../hooks/useRole';
import { Layout } from '../components/Layout';
import { MdSearch, MdFilterList, MdDownload, MdClose, MdInfo } from 'react-icons/md';

const CLASS_BADGE = {
  Rebut:       'bg-red-100 text-red-700',
  Acceptable:  'bg-orange-100 text-orange-700',
  Cible:       'bg-green-100 text-green-700',
  Inefficient: 'bg-yellow-100 text-yellow-700',
};

const PARAMS_LABELS = {
  meltTemperature: 'Temp. Fusion (°C)', moldTemperature: 'Temp. Moule (°C)',
  fillingTime: 'Temps Remplissage (s)', plasticizingTime: 'Temps Plastification (s)',
  cycleTime: 'Temps Cycle (s)', closingForce: 'Force Fermeture',
  clampingForcePeak: 'Pic Force Serrage', torquePeak: 'Pic Couple (N·m)',
  torqueMean: 'Couple Moyen (N·m)', backPressurePeak: 'Pic Press. Dorsale (Bar)',
  injectionPressurePeak: "Pic Press. Injection (Bar)", screwPosition: 'Position Vis (cm)',
  shotVolume: 'Volume Injecté (cm³)',
};

const downloadCSV = (predictions) => {
  const header = ['Date', 'Opérateur', 'Classe', ...'meltTemperature,moldTemperature,fillingTime,plasticizingTime,cycleTime,closingForce,clampingForcePeak,torquePeak,torqueMean,backPressurePeak,injectionPressurePeak,screwPosition,shotVolume'.split(',')];
  const rows = predictions.map(p => [
    new Date(p.timestamp).toLocaleString('fr-FR'),
    p.username, p.className,
    ...Object.values(p.parameters || {}),
  ]);
  const csv = [header, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'historique.csv'; a.click();
};

export const History = () => {
  const axios = useAxiosPrivate();
  const { isManager } = useRole();
  const [data, setData] = useState({ predictions: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ className: '', from: '', to: '', username: '' });
  const [detail, setDetail] = useState(null);
  const limit = 20;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...Object.fromEntries(Object.entries(filter).filter(([, v]) => v)) };
      const fn = isManager ? getAllPredictions : getHistory;
      const res = await fn(axios, params);
      setData(res.data);
    } catch {
      setData({ predictions: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, filter, isManager]);

  const totalPages = Math.ceil(data.total / limit);

  return (
    <Layout title="Historique des prédictions">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Classe</label>
          <select
            value={filter.className}
            onChange={e => { setFilter(f => ({ ...f, className: e.target.value })); setPage(1); }}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Toutes</option>
            {['Rebut', 'Acceptable', 'Cible', 'Inefficient'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Du</label>
          <input type="date" value={filter.from}
            onChange={e => { setFilter(f => ({ ...f, from: e.target.value })); setPage(1); }}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Au</label>
          <input type="date" value={filter.to}
            onChange={e => { setFilter(f => ({ ...f, to: e.target.value })); setPage(1); }}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        {isManager && (
          <div>
            <label className="block text-xs text-slate-500 mb-1">Opérateur</label>
            <input type="text" value={filter.username} placeholder="Rechercher…"
              onChange={e => { setFilter(f => ({ ...f, username: e.target.value })); setPage(1); }}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-40"
            />
          </div>
        )}

        <button
          onClick={() => downloadCSV(data.predictions)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 ml-auto"
        >
          <MdDownload /> Exporter CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Date</th>
                {isManager && <th className="text-left px-4 py-3 text-slate-500 font-medium">Opérateur</th>}
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Classe</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Temp. Fusion</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Temp. Moule</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Temps Cycle</th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">Détail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Chargement…</td></tr>
              ) : data.predictions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Aucune prédiction trouvée.</td></tr>
              ) : data.predictions.map(p => (
                <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {new Date(p.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  {isManager && <td className="px-4 py-3 text-slate-700">{p.username}</td>}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CLASS_BADGE[p.className] || 'bg-slate-100 text-slate-700'}`}>
                      {p.className}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{p.parameters?.meltTemperature?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{p.parameters?.moldTemperature?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{p.parameters?.cycleTime?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setDetail(p)} className="text-blue-500 hover:text-blue-700">
                      <MdInfo className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-sm text-slate-500">{data.total} résultats</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-slate-50">← Préc.</button>
            <span className="px-3 py-1 text-sm">{page}/{totalPages || 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-slate-50">Suiv. →</button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Détail de la prédiction</h3>
              <button onClick={() => setDetail(null)}><MdClose className="text-xl text-slate-400" /></button>
            </div>
            <div className="mb-3">
              <span className={`px-2 py-1 rounded-full text-sm font-semibold ${CLASS_BADGE[detail.className]}`}>
                Classe : {detail.className}
              </span>
              <p className="text-xs text-slate-500 mt-1">{new Date(detail.timestamp).toLocaleString('fr-FR')}</p>
              <p className="text-xs text-slate-500">Opérateur : {detail.username}</p>
            </div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">Paramètres</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(detail.parameters || {}).map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded p-2">
                  <p className="text-xs text-slate-500">{PARAMS_LABELS[k] || k}</p>
                  <p className="text-sm font-medium text-slate-800">{v?.toFixed ? v.toFixed(3) : v}</p>
                </div>
              ))}
            </div>
            {detail.recommendation && (
              <p className="mt-4 text-sm text-slate-600 bg-blue-50 rounded p-3">{detail.recommendation}</p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};
