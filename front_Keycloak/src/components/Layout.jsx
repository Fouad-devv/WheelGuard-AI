import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout = ({ title, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: '#f1f5f9' }}>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed overlay on mobile, static on desktop */}
      <div
        className={`fixed top-0 left-0 h-full z-50 lg:static lg:h-auto lg:z-auto transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
