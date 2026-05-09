import { useEffect, useState } from 'react';
import useAxiosPrivate from '../api/useAxiosPrivate';
import { getHistory, getAllPredictions } from '../api/predictionApi';
import { useRole } from '../hooks/useRole';
import { Layout } from '../components/Layout';
import { MdDownload, MdClose, MdInfo, MdFilterList, MdChevronRight } from 'react-icons/md';
import { Spinner } from '../components/Spinner';

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
  injectionPressurePeak: 'Pic Press. Injection (Bar)', screwPosition: 'Position Vis (cm)',
  shotVolume: 'Volume Injecté (cm³)',
};

const fmtDate = (ts) =>
  new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const fmtDateShort = (ts) =>
  new Date(ts).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const downloadCSV = (predictions) => {
  const header = ['Date', 'Opérateur', 'Classe', 'meltTemperature', 'moldTemperature', 'fillingTime',
    'plasticizingTime', 'cycleTime', 'closingForce', 'clampingForcePeak', 'torquePeak',
    'torqueMean', 'backPressurePeak', 'injectionPressurePeak', 'screwPosition', 'shotVolume'];
  const rows = predictions.map(p => [
    fmtDate(p.timestamp), p.username, p.className,
    ...Object.values(p.parameters || {}),
  ]);
  const csv  = [header, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = 'historique.csv'; a.click();
};

export const History = () => {
  const axios = useAxiosPrivate();
  const { isManager } = useRole();
  const [data, setData]       = useState({ predictions: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [filter, setFilter]   = useState({ className: '', from: '', to: '', username: '' });
  const [detail, setDetail]   = useState(null);
  const [showFilters, setShowFilters] = useState(false);
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
  const setF = (key, val) => { setFilter(f => ({ ...f, [key]: val })); setPage(1); };

  return (
    <Layout title="Historique des prédictions">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <button
          onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <MdFilterList className="text-base" />
          Filtres
          {Object.values(filter).some(Boolean) && (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => downloadCSV(data.predictions)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <MdDownload className="text-base" /> Exporter CSV
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Classe</label>
              <select
                value={filter.className}
                onChange={e => setF('className', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes</option>
                {['Rebut', 'Acceptable', 'Cible', 'Inefficient'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Du</label>
              <input
                type="date" value={filter.from}
                onChange={e => setF('from', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Au</label>
              <input
                type="date" value={filter.to}
                onChange={e => setF('to', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {isManager && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Opérateur</label>
                <input
                  type="text" value={filter.username} placeholder="Rechercher…"
                  onChange={e => setF('username', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {Object.values(filter).some(Boolean) && (
              <button
                onClick={() => { setFilter({ className: '', from: '', to: '', username: '' }); setPage(1); }}
                className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <MdClose className="text-base" /> Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-slate-400 mb-3">{data.total} résultat{data.total !== 1 ? 's' : ''}</p>

      {/* ── MOBILE: card list ── */}
      <div className="block md:hidden space-y-2 mb-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-10 flex justify-center"><Spinner size="md" label="Chargement…" /></div>
        ) : data.predictions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm">Aucune prédiction trouvée.</div>
        ) : data.predictions.map(p => (
          <div
            key={p._id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${CLASS_BADGE[p.className] || 'bg-slate-100 text-slate-700'}`}>
                {p.className}
              </span>
              <span className="text-xs text-slate-400 shrink-0">{fmtDateShort(p.timestamp)}</span>
            </div>
            {isManager && (
              <p className="text-sm font-medium text-slate-700 mb-2">{p.username}</p>
            )}
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              {[
                { label: 'Temp. Fusion', val: p.parameters?.meltTemperature?.toFixed(1) },
                { label: 'Temp. Moule',  val: p.parameters?.moldTemperature?.toFixed(1) },
                { label: 'Cycle (s)',    val: p.parameters?.cycleTime?.toFixed(1) },
              ].map(({ label, val }) => (
                <div key={label} className="bg-slate-50 rounded-lg p-2">
                  <p className="text-slate-400 mb-0.5">{label}</p>
                  <p className="font-semibold text-slate-700">{val ?? '—'}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setDetail(p)}
              className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-800"
            >
              Voir tous les paramètres <MdChevronRight />
            </button>
          </div>
        ))}
      </div>

      {/* ── DESKTOP: table ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
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
                <tr><td colSpan={7} className="py-12"><div className="flex justify-center"><Spinner size="md" /></div></td></tr>
              ) : data.predictions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Aucune prédiction trouvée.</td></tr>
              ) : data.predictions.map(p => (
                <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{fmtDate(p.timestamp)}</td>
                  {isManager && <td className="px-4 py-3 text-slate-700">{p.username}</td>}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CLASS_BADGE[p.className] || 'bg-slate-100 text-slate-700'}`}>
                      {p.className}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{p.parameters?.meltTemperature?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{p.parameters?.moldTemperature?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{p.parameters?.cycleTime?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setDetail(p)} className="text-blue-500 hover:text-blue-700 transition-colors">
                      <MdInfo className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 flex-wrap gap-2">
          <span className="text-sm text-slate-500">{data.total} résultats</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              ← Préc.
            </button>
            <span className="px-2 py-1 text-sm text-slate-600">{page} / {totalPages || 1}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Suiv. →
            </button>
          </div>
        </div>
      </div>

      {/* Mobile pagination */}
      <div className="flex md:hidden items-center justify-between mt-4 px-1">
        <span className="text-xs text-slate-400">Page {page}/{totalPages || 1}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white disabled:opacity-40"
          >← Préc.</button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white disabled:opacity-40"
          >Suiv. →</button>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Détail de la prédiction</h3>
              <button onClick={() => setDetail(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <MdClose className="text-xl" />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${CLASS_BADGE[detail.className]}`}>
                {detail.className}
              </span>
              <div className="text-xs text-slate-500">
                <p>{fmtDate(detail.timestamp)}</p>
                <p>{detail.username}</p>
              </div>
            </div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Paramètres</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(detail.parameters || {}).map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">{PARAMS_LABELS[k] || k}</p>
                  <p className="text-sm font-semibold text-slate-800">{v?.toFixed ? v.toFixed(3) : v}</p>
                </div>
              ))}
            </div>
            {detail.recommendation && (
              <div className="mt-4 text-sm text-slate-600 bg-blue-50 rounded-xl p-3">
                {detail.recommendation}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};
