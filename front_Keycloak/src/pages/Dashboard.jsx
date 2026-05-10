import { useEffect, useState } from 'react';
import useAxiosPrivate from '../api/useAxiosPrivate';
import { getDashboardStats, getGlobalStats } from '../api/statsApi';
import { useRole } from '../hooks/useRole';
import { Layout } from '../components/Layout';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  MdCheckCircle, MdWarning, MdTrendingUp, MdBarChart,
  MdFactory, MdRefresh,
} from 'react-icons/md';
import { Spinner } from '../components/Spinner';

const CLASS_COLORS = {
  Cible: '#22c55e', Acceptable: '#3b82f6', Limite: '#f97316', Rebut: '#ef4444',
};

const KpiCard = ({ icon: Icon, label, value, color = 'blue' }) => {
  const colorMap = {
    blue:   { icon: 'bg-blue-50 text-blue-600',   val: 'text-blue-700' },
    red:    { icon: 'bg-red-50 text-red-600',      val: 'text-red-700' },
    green:  { icon: 'bg-green-50 text-green-600',  val: 'text-green-700' },
    orange: { icon: 'bg-orange-50 text-orange-600',val: 'text-orange-700' },
  };
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
      <div className={`p-2.5 sm:p-3 rounded-xl ${c.icon} shrink-0`}>
        <Icon className="text-xl sm:text-2xl" />
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-slate-500 truncate">{label}</p>
        <p className={`text-xl sm:text-2xl font-bold ${c.val}`}>{value ?? '—'}</p>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const axios = useAxiosPrivate();
  const { isManager } = useRole();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const fn  = isManager ? getGlobalStats : getDashboardStats;
      const res = await fn(axios);
      setData(res.data);
    } catch {
      setError('Erreur lors du chargement des statistiques.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [isManager]);

  if (loading) return (
    <Layout title="Tableau de bord">
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" label="Chargement des statistiques…" />
      </div>
    </Layout>
  );

  if (error) return (
    <Layout title="Tableau de bord">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
    </Layout>
  );

  const { kpis, classDistribution, dailyTrend, featureImportance, operatorStats } = data;

  return (
    <Layout title="Tableau de bord">
      {/* Header row */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <p className="text-slate-500 text-sm">
          {isManager ? 'Vue globale — tous les opérateurs' : 'Vue personnelle — vos prédictions'}
        </p>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <MdRefresh className="text-base" /> Actualiser
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KpiCard icon={MdFactory}    label="Aujourd'hui"   value={kpis.today ?? kpis.total} color="blue" />
        <KpiCard icon={MdBarChart}   label="Cette semaine"  value={kpis.week}                color="blue" />
        <KpiCard icon={MdTrendingUp} label="Ce mois"        value={kpis.month}               color="green" />
        <KpiCard icon={MdWarning}    label="Taux de rebut"  value={`${kpis.rebutRate}%`}     color="red" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <h2 className="font-semibold text-slate-700 text-sm sm:text-base mb-4">
            Répartition des classes de qualité
          </h2>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDistribution.filter(e => e.value > 0)}
                  cx="50%" cy="50%"
                  innerRadius="40%" outerRadius="65%"
                  dataKey="value"
                  label={({ name, percent }) => percent > 0.04 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {classDistribution.filter(e => e.value > 0).map(entry => (
                    <Cell key={entry.name} fill={CLASS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={v => [v, 'Pièces']} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart — daily trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <h2 className="font-semibold text-slate-700 text-sm sm:text-base mb-4">
            Tendance des 7 derniers jours
          </h2>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="cible"      fill="#22c55e" name="Cible"      stackId="a" />
                <Bar dataKey="acceptable" fill="#3b82f6" name="Acceptable" stackId="a" />
                <Bar dataKey="limite"     fill="#f97316" name="Limite"     stackId="a" />
                <Bar dataKey="rebut"      fill="#ef4444" name="Rebut"      stackId="a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature importance — manager only */}
      {isManager && featureImportance?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-6">
          <h2 className="font-semibold text-slate-700 text-sm sm:text-base mb-4">
            Importance des paramètres machine
          </h2>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={130} />
                <Tooltip formatter={v => [v.toFixed(4), 'Importance']} />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Operator stats — manager only */}
      {isManager && operatorStats?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700 text-sm sm:text-base">
              Activité des opérateurs (cette semaine)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[320px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 sm:px-5 py-3 text-slate-500 font-medium">Opérateur</th>
                  <th className="text-right px-4 sm:px-5 py-3 text-slate-500 font-medium">Prédictions</th>
                </tr>
              </thead>
              <tbody>
                {operatorStats.map(op => (
                  <tr key={op.username} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 sm:px-5 py-3 text-slate-700">{op.username}</td>
                    <td className="px-4 sm:px-5 py-3 text-right font-semibold text-slate-800">{op.count}</td>
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
