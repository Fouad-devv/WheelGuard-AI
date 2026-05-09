import { useEffect, useState } from 'react';
import useAxiosPrivate from '../api/useAxiosPrivate';
import { getDashboardStats, getGlobalStats } from '../api/statsApi';
import { useRole } from '../hooks/useRole';
import { Layout } from '../components/Layout';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, ResponsiveContainer,
} from 'recharts';
import {
  MdCheckCircle, MdWarning, MdTrendingUp, MdBarChart,
  MdFactory, MdRefresh,
} from 'react-icons/md';

const CLASS_COLORS = { Rebut: '#ef4444', Acceptable: '#f97316', Cible: '#22c55e', Inefficient: '#eab308' };

const KpiCard = ({ icon: Icon, label, value, sub, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600', red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600', orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorMap[color]}`}>
        <Icon className="text-2xl" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const axios = useAxiosPrivate();
  const { isManager } = useRole();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const fn = isManager ? getGlobalStats : getDashboardStats;
      const res = await fn(axios);
      setData(res.data);
    } catch (e) {
      setError('Erreur lors du chargement des statistiques.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [isManager]);

  if (loading) return (
    <Layout title="Tableau de bord">
      <div className="flex items-center justify-center h-64 text-slate-500">Chargement…</div>
    </Layout>
  );

  if (error) return (
    <Layout title="Tableau de bord">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
    </Layout>
  );

  const { kpis, classDistribution, dailyTrend, featureImportance, operatorStats } = data;

  return (
    <Layout title="Tableau de bord">
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-500 text-sm">
          {isManager ? 'Vue globale — tous les opérateurs' : 'Vue personnelle — vos prédictions'}
        </p>
        <button onClick={fetchData} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
          <MdRefresh /> Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={MdFactory}     label="Aujourd'hui"   value={kpis.today ?? kpis.total} color="blue" />
        <KpiCard icon={MdBarChart}    label="Cette semaine"  value={kpis.week}   color="blue" />
        <KpiCard icon={MdTrendingUp}  label="Ce mois"        value={kpis.month}  color="blue" />
        <KpiCard icon={MdWarning}     label="Taux de rebut"  value={`${kpis.rebutRate}%`} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie: class distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Répartition des classes de qualité</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={classDistribution}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {classDistribution.map((entry) => (
                  <Cell key={entry.name} fill={CLASS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, 'Pièces']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar: daily trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Tendance des 7 derniers jours</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="rebut"       fill="#ef4444" name="Rebut" stackId="a" />
              <Bar dataKey="acceptable"  fill="#f97316" name="Acceptable" stackId="a" />
              <Bar dataKey="cible"       fill="#22c55e" name="Cible" stackId="a" />
              <Bar dataKey="inefficient" fill="#eab308" name="Inefficient" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature importance (manager only) */}
      {isManager && featureImportance?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="font-semibold text-slate-700 mb-4">Importance des paramètres machine</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={featureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={170} />
              <Tooltip formatter={(v) => [v.toFixed(4), 'Importance']} />
              <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Operator stats (manager only) */}
      {isManager && operatorStats?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Activité des opérateurs (cette semaine)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-500 font-medium">Opérateur</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Prédictions</th>
                </tr>
              </thead>
              <tbody>
                {operatorStats.map((op, i) => (
                  <tr key={op.username} className="border-b border-slate-50">
                    <td className="py-2 text-slate-700">{op.username}</td>
                    <td className="py-2 text-right font-semibold text-slate-800">{op.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};
