import { useState } from 'react';
import useAxiosPrivate from '../api/useAxiosPrivate';
import { postPredict } from '../api/predictionApi';
import { Layout } from '../components/Layout';
import { MdBolt, MdCheckCircle, MdWarning, MdInfo, MdError, MdRestartAlt } from 'react-icons/md';
import { Spinner } from '../components/Spinner';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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
  Rebut:       { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', icon: MdError,       text: '#b91c1c' },
  Acceptable:  { color: '#f97316', bg: '#fff7ed', border: '#fdba74', icon: MdWarning,     text: '#c2410c' },
  Cible:       { color: '#22c55e', bg: '#f0fdf4', border: '#86efac', icon: MdCheckCircle, text: '#15803d' },
  Inefficient: { color: '#eab308', bg: '#fefce8', border: '#fde047', icon: MdInfo,        text: '#a16207' },
};

const initForm = () => Object.fromEntries(FIELDS.map(f => [f.key, '']));

export const Prediction = () => {
  const axios = useAxiosPrivate();
  const [form, setForm]       = useState(initForm());
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setResult(null);
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
        <div
          className="mb-6 rounded-2xl border-2 p-4 sm:p-6"
          style={{ background: meta.bg, borderColor: meta.border }}
        >
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Left: class + recommendation */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <Icon className="text-3xl shrink-0" style={{ color: meta.text }} />
                <div>
                  <p className="text-xs text-slate-500">Classe prédite</p>
                  <p className="text-2xl font-bold" style={{ color: meta.text }}>{result.classLabel}</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: meta.text }}>{result.recommendation}</p>

              {/* Probability badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {probData.map(p => (
                  <div
                    key={p.name}
                    className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 text-xs border border-slate-200 shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                    <span className="text-slate-600">{p.name}: <strong>{p.value}%</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: pie chart */}
            <div className="w-full sm:w-48 shrink-0">
              <p className="text-xs text-slate-500 text-center mb-1">Probabilités</p>
              <div className="h-36 sm:h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={probData} cx="50%" cy="50%"
                      outerRadius="70%" dataKey="value"
                      label={({ value }) => `${value}%`} labelLine={false}
                    >
                      {probData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={v => [`${v}%`, 'Prob.']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <h2 className="font-semibold text-slate-700 text-sm sm:text-base mb-5 flex items-center gap-2">
          <MdBolt className="text-blue-500 text-lg" />
          Paramètres de production — 13 variables
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {FIELDS.map(({ key, label, unit, step, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {label}
                  {unit && <span className="text-slate-400 font-normal ml-1">({unit})</span>}
                </label>
                <input
                  type="number"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  step={step}
                  placeholder={placeholder}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder:text-slate-300 transition-shadow"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                         text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm shadow-sm shadow-blue-200"
            >
              {loading ? <><Spinner size="sm" /><span>Calcul en cours…</span></> : <><MdBolt className="text-base" /><span>Lancer la prédiction</span></>}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm transition-colors"
            >
              <MdRestartAlt className="text-base" />
              Réinitialiser
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
