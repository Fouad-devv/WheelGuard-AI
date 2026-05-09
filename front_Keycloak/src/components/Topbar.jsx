import { MdMenu } from 'react-icons/md';

export const Topbar = ({ title, onMenuClick }) => (
  <header
    className="h-14 flex items-center px-4 sm:px-6 shrink-0 gap-3"
    style={{
      background: 'rgba(255,255,255,0.98)',
      borderBottom: '1px solid rgba(226,232,240,0.8)',
      backdropFilter: 'blur(8px)',
    }}
  >
    {/* Hamburger — mobile only */}
    <button
      onClick={onMenuClick}
      className="lg:hidden -ml-1 p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      aria-label="Ouvrir le menu"
    >
      <MdMenu className="text-xl" />
    </button>

    <div
      className="w-1 h-5 rounded-full shrink-0"
      style={{ background: 'linear-gradient(180deg, #3b82f6, #6366f1)' }}
    />
    <h1 className="text-slate-700 font-semibold text-[15px] tracking-wide truncate">{title}</h1>
  </header>
);
