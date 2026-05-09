import { MdPrecisionManufacturing } from 'react-icons/md';

const SIZE = {
  sm: { ring: 'w-5 h-5',   inner: 'inset-[2px]', border: 'border-[2px]' },
  md: { ring: 'w-9 h-9',   inner: 'inset-[3px]', border: 'border-[2px]' },
  lg: { ring: 'w-14 h-14', inner: 'inset-[4px]', border: 'border-[3px]' },
};

/* ─── Reusable inline spinner ─────────────────────────────────────── */
export const Spinner = ({ size = 'md', label }) => {
  const s = SIZE[size];
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${s.ring}`}>
        {/* Outer ring */}
        <div
          className={`absolute inset-0 rounded-full ${s.border} animate-spin`}
          style={{
            borderColor: 'transparent',
            borderTopColor: '#3b82f6',
            borderRightColor: '#6366f1',
            animationDuration: '0.75s',
            animationTimingFunction: 'linear',
          }}
        />
        {/* Inner ring — counter-spin */}
        <div
          className={`absolute ${s.inner} rounded-full ${s.border} animate-spin`}
          style={{
            borderColor: 'transparent',
            borderTopColor: '#8b5cf6',
            borderLeftColor: '#a78bfa',
            animationDuration: '0.55s',
            animationDirection: 'reverse',
            animationTimingFunction: 'linear',
          }}
        />
      </div>
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );
};

/* ─── Full-screen loader — light theme, matches the app ────────────── */
export const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50">
    {/* Top accent line */}
    <div
      className="absolute top-0 left-0 right-0 h-[3px]"
      style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)' }}
    />

    {/* Logo icon */}
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
        boxShadow: '0 8px 28px rgba(99,102,241,0.35)',
      }}
    >
      <MdPrecisionManufacturing className="text-white text-[28px]" />
    </div>

    {/* Brand */}
    <p className="text-slate-700 font-bold text-lg tracking-wide mb-0.5">LumiQuality</p>
    <p
      className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-7"
      style={{ color: '#6366f1' }}
    >
      AI Platform
    </p>

    {/* Spinner */}
    <Spinner size="lg" />
  </div>
);
