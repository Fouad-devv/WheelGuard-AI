import { useState } from 'react';
import useAxiosPrivate from '../api/useAxiosPrivate';
import { postPredict } from '../api/predictionApi';
import { Layout } from '../components/Layout';
import {
  MdBolt, MdCheckCircle, MdWarning, MdInfo, MdError, MdRestartAlt,
  MdThermostat, MdTimer, MdFlashOn, MdSpeed, MdTune,
} from 'react-icons/md';
import { Spinner } from '../components/Spinner';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const GROUPS = [
  {
    key: 'temperature',
    label: 'Températures',
    icon: MdThermostat,
    accent: '#ef4444',
    fields: [
      {
        key: 'meltTemperature',
        label: 'Température de fusion',
        desc: 'Température du plastique fondu dans le fourreau juste avant injection',
        unit: '°C', step: 0.001, placeholder: '106.5',
      },
      {
        key: 'moldTemperature',
        label: 'Température du moule',
        desc: "Température de la cavité du moule qui met en forme la pièce finale",
        unit: '°C', step: 0.001, placeholder: '80.6',
      },
    ],
  },
  {
    key: 'time',
    label: 'Temps',
    icon: MdTimer,
    accent: '#3b82f6',
    fields: [
      {
        key: 'fillingTime',
        label: 'Temps de remplissage',
        desc: "Durée nécessaire pour remplir entièrement la cavité du moule en matière fondue",
        unit: 's', step: 0.001, placeholder: '7.12',
      },
      {
        key: 'plasticizingTime',
        label: 'Temps de plastification',
        desc: "Durée de fusion et d'homogénéisation de la matière par la vis d'Archimède",
        unit: 's', step: 0.001, placeholder: '3.16',
      },
      {
        key: 'cycleTime',
        label: 'Temps de cycle',
        desc: "Durée totale d'un cycle complet, de fermeture à ouverture du moule",
        unit: 's', step: 0.01, placeholder: '74.83',
      },
    ],
  },
  {
    key: 'force',
    label: 'Forces & Couples',
    icon: MdFlashOn,
    accent: '#8b5cf6',
    fields: [
      {
        key: 'closingForce',
        label: 'Force de fermeture',
        desc: "Force exercée pour maintenir les deux demi-moules fermés lors de l'injection",
        unit: 'kN', step: 0.01, placeholder: '886.9',
      },
      {
        key: 'clampingForcePeak',
        label: 'Pic force de serrage',
        desc: 'Valeur maximale de la force de serrage enregistrée pendant le cycle',
        unit: 'kN', step: 0.01, placeholder: '904.0',
      },
      {
        key: 'torquePeak',
        label: 'Pic de couple',
        desc: 'Couple de rotation maximal appliqué par la vis lors de la plastification',
        unit: 'N·m', step: 0.1, placeholder: '116.9',
      },
      {
        key: 'torqueMean',
        label: 'Couple moyen',
        desc: "Couple de rotation moyen de la vis sur l'ensemble de la phase de plastification",
        unit: 'N·m', step: 0.1, placeholder: '104.3',
      },
    ],
  },
  {
    key: 'pressure',
    label: 'Pressions',
    icon: MdSpeed,
    accent: '#f97316',
    fields: [
      {
        key: 'backPressurePeak',
        label: 'Pic pression dorsale',
        desc: "Pression dorsale maximale s'opposant au recul de la vis pendant la plastification",
        unit: 'Bar', step: 0.1, placeholder: '145.6',
      },
      {
        key: 'injectionPressurePeak',
        label: "Pic pression d'injection",
        desc: 'Pression maximale appliquée en tête de vis lors du remplissage du moule',
        unit: 'Bar', step: 0.1, placeholder: '922.3',
      },
    ],
  },
  {
    key: 'geometry',
    label: 'Géométrie & Volume',
    icon: MdTune,
    accent: '#10b981',
    fields: [
      {
        key: 'screwPosition',
        label: 'Position vis (fin maintien)',
        desc: 'Position axiale de la vis à la fin de la phase de maintien en pression',
        unit: 'cm', step: 0.01, placeholder: '8.82',
      },
      {
        key: 'shotVolume',
        label: 'Volume injecté',
        desc: 'Volume de matière plastique injectée dans le moule à chaque cycle',
        unit: 'cm³', step: 0.01, placeholder: '18.73',
      },
    ],
  },
];

const FIELDS = GROUPS.flatMap(g => g.fields);

const CLASS_META = {
  Rebut:      { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', icon: MdError,       text: '#b91c1c' },
  Acceptable: { color: '#f97316', bg: '#fff7ed', border: '#fdba74', icon: MdWarning,     text: '#c2410c' },
  Cible:      { color: '#22c55e', bg: '#f0fdf4', border: '#86efac', icon: MdCheckCircle, text: '#15803d' },
  Limite:     { color: '#eab308', bg: '#fefce8', border: '#fde047', icon: MdInfo,        text: '#a16207' },
};

const initForm = () => Object.fromEntries(FIELDS.map(f => [f.key, '']));

function FieldInput({ field, value, onChange }) {
  return (
    <div>
      <label className="block mb-1.5 cursor-text">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[13px] font-semibold text-slate-700 leading-snug">{field.label}</span>
          {field.unit && (
            <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-1.5 py-px rounded-md leading-none shrink-0">
              {field.unit}
            </span>
          )}
        </div>
        <span className="block text-[11px] text-slate-400 leading-relaxed">{field.desc}</span>
      </label>
      <input
        type="number"
        name={field.key}
        value={value}
        onChange={onChange}
        step={field.step}
        placeholder={field.placeholder}
        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800
                   bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                   placeholder:text-slate-300 transition-all duration-200 hover:border-slate-300 shadow-sm"
      />
    </div>
  );
}

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
        name:  ['', 'Cible', 'Acceptable', 'Limite', 'Rebut'][Number(k)],
        value: Math.round(v * 100),
        color: ['', '#22c55e', '#f97316', '#eab308', '#ef4444'][Number(k)],
      }))
    : [];

  return (
    <Layout title="Prédiction en temps réel">

      {/* ── Result card ── */}
      {result && meta && (
        <div className="mb-6 rounded-2xl border-2 overflow-hidden shadow-sm" style={{ borderColor: meta.border }}>
          {/* Coloured header band */}
          <div className="px-5 py-4 flex items-center gap-3" style={{ background: meta.color }}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Icon className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-white/75 text-[11px] font-semibold uppercase tracking-widest">
                Résultat de la prédiction
              </p>
              <p className="text-white text-xl font-bold leading-tight">{result.classLabel}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col sm:flex-row gap-6" style={{ background: meta.bg }}>
            {/* Probability bars */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">
                Probabilités par classe
              </p>
              <div className="space-y-3">
                {probData.map(p => (
                  <div key={p.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">{p.name}</span>
                      <span className="font-bold tabular-nums" style={{ color: p.color }}>{p.value}%</span>
                    </div>
                    <div className="h-2 bg-white/70 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${p.value}%`, background: p.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {result.recommendation && (
                <p className="mt-4 text-sm leading-relaxed" style={{ color: meta.text }}>
                  {result.recommendation}
                </p>
              )}
            </div>

            {/* Pie chart */}
            <div className="w-full sm:w-44 shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 text-center mb-2">
                Distribution
              </p>
              <div className="h-36 sm:h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={probData.filter(p => p.value > 0)}
                      cx="50%" cy="50%"
                      outerRadius="75%"
                      dataKey="value"
                      label={({ value }) => value > 5 ? `${value}%` : ''}
                      labelLine={false}
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

      {/* ── Error ── */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700 text-sm shadow-sm">
          <MdError className="text-xl shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Card header */}
        <div
          className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f1f5f9 100%)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            <MdBolt className="text-white text-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-800">Paramètres de production</h2>
            <p className="text-xs text-slate-400">
              13 variables — Renseignez tous les paramètres du cycle d'injection
            </p>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            {FIELDS.length} champs
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          {GROUPS.map((group, gi) => (
            <div key={group.key} className={gi < GROUPS.length - 1 ? 'mb-8' : ''}>

              {/* Group separator */}
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: group.accent + '18' }}
                >
                  <group.icon className="text-[16px]" style={{ color: group.accent }} />
                </div>
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.14em] shrink-0"
                  style={{ color: group.accent }}
                >
                  {group.label}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: `linear-gradient(90deg, ${group.accent}35, transparent)` }}
                />
                <span className="text-[11px] text-slate-300 shrink-0 tabular-nums">
                  {group.fields.length} var.
                </span>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-5">
                {group.fields.map(f => (
                  <FieldInput key={f.key} field={f} value={form[f.key]} onChange={handleChange} />
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-5 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 text-white font-semibold px-7 py-3 rounded-xl
                         text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              style={{
                background: loading
                  ? '#93c5fd'
                  : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                boxShadow: loading ? 'none' : '0 4px 18px rgba(99,102,241,0.35)',
              }}
            >
              {loading
                ? <><Spinner size="sm" /><span>Calcul en cours…</span></>
                : <><MdBolt className="text-base" /><span>Lancer la prédiction</span></>
              }
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200
                         text-slate-500 hover:bg-slate-50 hover:border-slate-300 text-sm transition-all duration-200 font-medium"
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
