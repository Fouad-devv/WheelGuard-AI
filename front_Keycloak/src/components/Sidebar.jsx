import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { useRole } from '../hooks/useRole';
import {
  MdDashboard, MdBolt, MdHistory, MdUploadFile,
  MdPeople, MdSecurity, MdPrecisionManufacturing,
  MdChevronLeft, MdChevronRight, MdLogout, MdEmail,
  MdKeyboardArrowUp,
} from 'react-icons/md';

const NAV = [
  { to: '/dashboard',  label: 'Tableau de bord',  icon: MdDashboard },
  { to: '/prediction', label: 'Prédiction',        icon: MdBolt },
  { to: '/history',    label: 'Historique',         icon: MdHistory },
  { to: '/batch',      label: 'Prédiction par lot', icon: MdUploadFile },
];

const ADMIN_NAV = [
  { to: '/admin/users', label: 'Utilisateurs',    icon: MdPeople },
  { to: '/admin/audit', label: "Journal d'audit", icon: MdSecurity },
];

const ROLE_LABELS = { admin: 'Administrateur', manager: 'Manager', operator: 'Opérateur' };

const ACTIVE_STYLE = {
  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
  boxShadow: '0 4px 20px rgba(99,102,241,0.40)',
};

function NavItem({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden
        ${collapsed ? 'justify-center py-[11px] px-0 mx-1' : 'gap-3 px-3 py-[10px] mx-1'}
        ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`
      }
      style={({ isActive }) => isActive ? ACTIVE_STYLE : {}}
    >
      {({ isActive }) => (
        <>
          {!isActive && (
            <>
              <span
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'rgba(148,163,184,0.07)' }}
              />
              <span
                className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center"
                style={{ background: 'linear-gradient(180deg, #3b82f6, #6366f1)' }}
              />
            </>
          )}
          <Icon className="relative z-10 shrink-0 text-[20px] transition-transform duration-200 group-hover:scale-110" />
          {!collapsed && (
            <span className="relative z-10 whitespace-nowrap tracking-wide">{label}</span>
          )}
        </>
      )}
    </NavLink>
  );
}

export const Sidebar = ({ onClose }) => {
  const [collapsed, setCollapsed]       = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile]         = useState(() => window.innerWidth < 1024);
  const { keycloak }                    = useKeycloak();
  const { isAdmin, isManager, username, email, roles } = useRole();
  const menuRef = useRef(null);

  const displayRole = roles.find(r => ROLE_LABELS[r]);
  const initials    = username ? username.slice(0, 2).toUpperCase() : '?';

  /* Track viewport size */
  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  /* Close user menu on outside click */
  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const isCollapsed   = collapsed && !isMobile;
  const handleLogout  = () => keycloak.logout({ redirectUri: window.location.origin + '/' });

  return (
    <aside
      className={`relative flex flex-col h-full shrink-0 transition-[width] duration-300 ease-in-out ${
        isCollapsed ? 'w-[68px]' : 'w-64'
      }`}
      style={{ background: 'linear-gradient(180deg, #0c1023 0%, #0f172a 60%, #14103a 100%)' }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)' }}
      />

      {/* Desktop collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="hidden lg:flex absolute -right-[13px] top-[70px] z-50 w-[26px] h-[26px] rounded-full items-center justify-center border transition-all duration-200 hover:scale-110 hover:border-indigo-500 shadow-lg shadow-black/40"
        style={{ background: '#1e293b', borderColor: 'rgba(100,116,139,0.5)' }}
        title={isCollapsed ? 'Agrandir' : 'Réduire'}
      >
        {isCollapsed
          ? <MdChevronRight className="text-slate-300 text-[14px]" />
          : <MdChevronLeft  className="text-slate-300 text-[14px]" />
        }
      </button>

      {/* Logo */}
      <div className={`flex items-center pt-6 pb-5 overflow-hidden ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'}`}>
        <div
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
        >
          <MdPrecisionManufacturing className="text-white text-[20px]" />
        </div>
        {!isCollapsed && (
          <div className="leading-tight whitespace-nowrap">
            <div className="text-white font-bold text-[15px] tracking-wide">LumiQuality</div>
            <div className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: '#818cf8' }}>
              AI Platform
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px mb-3" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto overflow-x-hidden pb-2">
        {!isCollapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 px-4 mb-1 mt-1">
            Menu
          </p>
        )}
        {NAV.map(item => (
          <NavItem key={item.to} {...item} collapsed={isCollapsed} />
        ))}

        {(isAdmin || isManager) && (
          <>
            <div className={`flex items-center mt-4 mb-1 ${isCollapsed ? 'justify-center px-1' : 'px-4'}`}>
              {isCollapsed
                ? <div className="w-6 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                : <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">Administration</p>
              }
            </div>
            {ADMIN_NAV.map(item => (
              <NavItem key={item.to} {...item} collapsed={isCollapsed} />
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="relative mt-auto" ref={menuRef}>
        <div className="mx-4 h-px mb-3" style={{ background: 'rgba(255,255,255,0.05)' }} />

        {/* User popup */}
        {userMenuOpen && (
          <div
            className={`absolute bottom-full mb-2 z-50 rounded-2xl border shadow-2xl overflow-hidden ${
              isCollapsed ? 'left-2 w-56' : 'left-3 right-3'
            }`}
            style={{
              background: 'linear-gradient(145deg, #1e293b, #1a1f3c)',
              borderColor: 'rgba(99,102,241,0.2)',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
            }}
          >
            {/* User info */}
            <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white font-semibold text-sm leading-tight truncate">{username}</div>
                  {displayRole && (
                    <span
                      className="inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
                    >
                      {ROLE_LABELS[displayRole] || displayRole}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-slate-400 text-xs">
                <MdEmail className="text-slate-500 text-sm shrink-0" />
                <span className="truncate">{email || 'email non défini'}</span>
              </div>
            </div>

            {/* Logout */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 group"
              >
                <MdLogout className="text-base transition-transform duration-200 group-hover:-translate-x-0.5" />
                Déconnexion
              </button>
            </div>
          </div>
        )}

        {/* User trigger button */}
        <button
          onClick={() => setUserMenuOpen(o => !o)}
          className={`group w-full flex items-center rounded-xl transition-all duration-200 mb-3 ${
            isCollapsed
              ? 'justify-center py-3 mx-0'
              : 'gap-3 px-3 py-2.5 mx-2'
          } hover:bg-white/5`}
          style={userMenuOpen ? { background: 'rgba(99,102,241,0.12)' } : {}}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            {initials}
          </div>

          {!isCollapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <div className="text-white text-[13px] font-medium leading-tight truncate">{username}</div>
                <div className="text-slate-500 text-[11px] truncate mt-0.5">
                  {ROLE_LABELS[displayRole] || displayRole || ''}
                </div>
              </div>
              <MdKeyboardArrowUp
                className={`text-slate-500 text-lg shrink-0 transition-transform duration-200 ${
                  userMenuOpen ? '' : 'rotate-180'
                }`}
              />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
