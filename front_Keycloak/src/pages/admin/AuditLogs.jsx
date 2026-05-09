import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import { getAuditLogs } from '../../api/statsApi';
import { Layout } from '../../components/Layout';
import { MdRefresh, MdFilterList, MdClose } from 'react-icons/md';
import { Spinner } from '../../components/Spinner';

const ACTION_BADGE = {
  CREATE:         'bg-green-100 text-green-700',
  DELETE:         'bg-red-100 text-red-700',
  DELETE_USER:    'bg-red-100 text-red-700',
  BATCH_PREDICT:  'bg-blue-100 text-blue-700',
  RESET_PASSWORD: 'bg-orange-100 text-orange-700',
};

const fmtDate = (ts) =>
  new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

const fmtDateShort = (ts) =>
  new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

export const AuditLogs = () => {
  const axios = useAxiosPrivate();
  const [data, setData]       = useState({ logs: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [filter, setFilter]   = useState({ username: '', action: '' });
  const [showFilters, setShowFilters] = useState(false);
  const limit = 30;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...Object.fromEntries(Object.entries(filter).filter(([, v]) => v)) };
      const res = await getAuditLogs(axios, params);
      setData(res.data);
    } catch {
      setData({ logs: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, filter]);

  const totalPages = Math.ceil(data.total / limit);
  const setF = (key, val) => { setFilter(f => ({ ...f, [key]: val })); setPage(1); };

  return (
    <Layout title="Journal d'audit">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <p className="text-slate-500 text-sm">{data.total} entrée{data.total !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <MdFilterList className="text-base" />
            Filtres
            {Object.values(filter).some(Boolean) && <span className="w-2 h-2 rounded-full bg-blue-500" />}
          </button>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
          <MdRefresh className="text-base" /> Actualiser
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Action</label>
              <select
                value={filter.action}
                onChange={e => setF('action', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes</option>
                {['CREATE', 'DELETE', 'DELETE_USER', 'BATCH_PREDICT', 'RESET_PASSWORD'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Utilisateur</label>
              <input
                type="text" value={filter.username} placeholder="Rechercher…"
                onChange={e => setF('username', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {Object.values(filter).some(Boolean) && (
              <button
                onClick={() => { setFilter({ username: '', action: '' }); setPage(1); }}
                className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <MdClose className="text-base" /> Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE: card list ── */}
      <div className="block sm:hidden space-y-2 mb-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-10 flex justify-center"><Spinner size="md" label="Chargement…" /></div>
        ) : data.logs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm">Aucune entrée.</div>
        ) : data.logs.map(log => (
          <div key={log._id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${ACTION_BADGE[log.action] || 'bg-slate-100 text-slate-600'}`}>
                {log.action}
              </span>
              <span className="text-[11px] text-slate-400 shrink-0">{fmtDateShort(log.timestamp)}</span>
            </div>
            <p className="text-sm font-semibold text-slate-700">{log.username}</p>
            <p className="text-xs text-slate-500 mt-0.5">{log.resource}</p>
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
              <span>{log.ipAddress}</span>
              {log.details && (
                <span className="truncate max-w-[160px]">{JSON.stringify(log.details)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP: table ── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Utilisateur</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Action</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Ressource</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-12"><div className="flex justify-center"><Spinner size="md" /></div></td></tr>
              ) : data.logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400">Aucune entrée.</td></tr>
              ) : data.logs.map(log => (
                <tr key={log._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{fmtDate(log.timestamp)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{log.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_BADGE[log.action] || 'bg-slate-100 text-slate-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.resource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 flex-wrap gap-2">
          <span className="text-sm text-slate-500">{data.total} entrées</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >← Préc.</button>
            <span className="px-2 py-1 text-sm text-slate-600">{page} / {totalPages || 1}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >Suiv. →</button>
          </div>
        </div>
      </div>

      {/* Mobile pagination */}
      <div className="flex sm:hidden items-center justify-between mt-4 px-1">
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
    </Layout>
  );
};
