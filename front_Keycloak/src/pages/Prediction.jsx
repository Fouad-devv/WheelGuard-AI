import { useState } from 'react';
import useAxiosPrivate from '../api/useAxiosPrivate';
import { postPredict } from '../api/predictionApi';
import { Layout } from '../components/Layout';
import { MdBolt, MdCheckCircle, MdWarning, MdInfo, MdError } from 'react-icons/md';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';

const FIELDS = [
  { key: 'meltTemperature',       label: 'Température de fusion',       unit: '°C',   step: 0.001, placeholder: 'ex: 106.5' },
  { key: 'moldTemperature',       label: 'Température du moule',        unit: '°C',   step: 0.001, placeholder: 'ex: 80.6' },
  { key: 'fillingTime',           label: 'Temps de remplissage',        unit: 's',    step: 0.001, placeholder: 'ex: 7.12' },
  { key: 'plasticizingTime',      label: 'Temps de plastification',     unit: 's',    step: 0.001, placeholder: 'ex: 3.16' },
  { key: 'cycleTime',             label: 'Temps de cycle',              unit: 's',    step: 0.01,  placeholder: 'ex: 74.83' },
  { key: 'closingForce',          label: 'Force de fermeture',          unit: '',     step: 0.01,  placeholder: 'ex: 886.9' },
  { key: 'clampingForcePeak',     label: 'Pic force de serrage',        unit: '',     step: 0.01,  placeholder: 'ex: 904.0' },
  { key: 'torquePeak',            label: 'Pic de couple',               unit: 'N·m', step: 0.1,   placeholder: 'ex: 116.9' },
  { key: 'torqueMean',            label: 'Couple moyen',                unit: 'N·m', step: 0.1,   placeholder: 'ex: 104.3' },
  { key: 'backPressurePeak',      label: 'Pic pression dorsale',        unit: 'Bar',  step: 0.1,   placeholder: 'ex: 145.6' },
  { key: 'injectionPressurePeak', label: "Pic pression d'injection",    unit: 'Bar',  step: 0.1,   placeholder: 'ex: 922.3' },
  { key: 'screwPosition',         label: 'Position vis (fin maintien)', unit: 'cm',   step: 0.01,  placeholder: 'ex: 8.82' },
  { key: 'shotVolume',            label: 'Volume injecté',              unit: 'cm³',  step: 0.01,  placeholder: 'ex: 18.73' },
];

const CLASS_META = {
  Rebut:       { color: '#ef4444', bg: 'bg-red-50',    border: 'border-red-300',    icon: MdError,        text: 'text-red-700' },
  Acceptable:  { color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-300', icon: MdWarning,      text: 'text-orange-700' },
  Cible:       { color: '#22c55e', bg: 'bg-green-50',  border: 'border-green-300',  icon: MdCheckCircle,  text: 'text-green-700' },
  Inefficient: { color: '#eab308', bg: 'bg-yellow-50', border: 'border-yellow-300', icon: MdInfo,         text: 'text-yellow-700' },
};

const initForm = () => Object.fromEntries(FIELDS.map(f => [f.key, '']));

export const Prediction = () => {
  const axios = useAxiosPrivate();
  const [form, setForm] = useState(initForm());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validate all fields
    const missing = FIELDS.filter(f => form[f.key] === '' || isNaN(Number(form[f.key])));
    if (missing.length) {
      setError(`Veuillez remplir correctement : ${missing.map(f => f.label).join(', ')}`);
      return;
    }

    const payload = Object.fromEntries(FIELDS.map(f => [f.key, Number(form[f.key])]));
    setLoading(true);
    try {
      const res = await postPredict(axios, payload);
      setResult(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la prédiction. Service ML indisponible ?');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setForm(initForm()); setResult(null); setError(''); };

  const meta = result ? CLASS_META[result.className] : null;
  const Icon = meta?.icon;

  // Build probabilities for pie chart
  const probData = result
    ? Object.entries(result.probabilities).map(([k, v]) => ({
        name: ['', 'Rebut', 'Acceptable', 'Cible', 'Inefficient'][Number(k)],
        value: Math.round(v * 100),
        color: ['', '#ef4444', '#f97316', '#22c55e', '#eab308'][Number(k)],
      }))
    : [];

  return (
    <Layout title="Prédiction en temps réel">

      {/* Result card */}
      {result && meta && (
        <div className={`mb-6 rounded-xl border-2 ${meta.bg} ${meta.border} p-6`}>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <div className={`flex items-center gap-3 mb-2`}>
                <Icon className={`text-3xl ${meta.text}`} />
                <div>
                  <p className="text-sm text-slate-500">Classe prédite</p>
                  <p className={`text-2xl font-bold ${meta.text}`}>{result.classLabel}</p>
                </div>
              </div>
              <p className={`text-sm ${meta.text} mt-3`}>{result.recommendation}</p>
            </div>

            <div className="w-full md:w-52">
              <p className="text-xs text-slate-500 text-center mb-1">Probabilités par classe</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={probData} cx="50%" cy="50%" outerRadius={60} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {probData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={v => [`${v}%`, 'Prob.']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {probData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 text-xs border">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span className="text-slate-600">{p.name}: <strong>{p.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
          <MdBolt className="text-blue-500" />
          Paramètres de production (13 variables)
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {FIELDS.map(({ key, label, unit, step, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {label} {unit && <span className="text-slate-400">({unit})</span>}
                </label>
                <input
                  type="number"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  step={step}
                  placeholder={placeholder}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder:text-slate-300"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                         text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              <MdBolt />
              {loading ? 'Calcul en cours…' : 'Lancer la prédiction'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
