export const Topbar = ({ title }) => (
  <header
    className="h-14 flex items-center justify-between px-6 shrink-0"
    style={{
      background: 'rgba(255,255,255,0.98)',
      borderBottom: '1px solid rgba(226,232,240,0.8)',
      backdropFilter: 'blur(8px)',
    }}
  >
    <div className="flex items-center gap-3">
      <div
        className="w-1 h-5 rounded-full"
        style={{ background: 'linear-gradient(180deg, #3b82f6, #6366f1)' }}
      />
      <h1 className="text-slate-700 font-semibold text-[15px] tracking-wide">{title}</h1>
    </div>
  </header>
);
