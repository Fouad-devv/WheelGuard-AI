import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import { getAuditLogs } from '../../api/statsApi';
import { Layout } from '../../components/Layout';
import { MdSecurity, MdRefresh } from 'react-icons/md';

const ACTION_BADGE = {
  CREATE:          'bg-green-100 text-green-700',
  DELETE:          'bg-red-100 text-red-700',
  DELETE_USER:     'bg-red-100 text-red-700',
  BATCH_PREDICT:   'bg-blue-100 text-blue-700',
  RESET_PASSWORD:  'bg-orange-100 text-orange-700',
};

export const AuditLogs = () => {
  const axios = useAxiosPrivate();
  const [data, setData] = useState({ logs: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ username: '', action: '' });
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

  return (
    <Layout title="Journal d'audit">
      <div className="flex justify-between items-center mb-4">
        <p className="text-slate-500 text-sm">{data.total} entrées dans le journal</p>
        <button onClick={fetchLogs} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
          <MdRefresh /> Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Action</label>
          <select value={filter.action}
            onChange={e => { setFilter(f => ({ ...f, action: e.target.value })); setPage(1); }}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Toutes</option>
            {['CREATE', 'DELETE', 'DELETE_USER', 'BATCH_PREDICT', 'RESET_PASSWORD'].map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Utilisateur</label>
          <input type="text" value={filter.username} placeholder="Rechercher…"
            onChange={e => { setFilter(f => ({ ...f, username: e.target.value })); setPage(1); }}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Utilisateur</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Action</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Ressource</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">IP</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Détails</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Chargement…</td></tr>
              ) : data.logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Aucune entrée.</td></tr>
              ) : data.logs.map(log => (
                <tr key={log._id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                    {new Date(log.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{log.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_BADGE[log.action] || 'bg-slate-100 text-slate-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.resource}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{log.ipAddress}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-sm text-slate-500">{data.total} entrées</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-slate-50">← Préc.</button>
            <span className="px-3 py-1 text-sm">{page}/{totalPages || 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-slate-50">Suiv. →</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
