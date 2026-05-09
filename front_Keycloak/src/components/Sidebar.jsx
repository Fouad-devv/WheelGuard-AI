import { NavLink } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import {
  MdDashboard, MdBolt, MdHistory, MdUploadFile,
  MdPeople, MdSecurity, MdPrecisionManufacturing,
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

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-600 text-white shadow-sm'
      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
  }`;

export const Sidebar = () => {
  const { isAdmin, isManager } = useRole();

  return (
    <aside className="w-64 min-h-screen bg-slate-800 flex flex-col py-6 px-3 gap-1 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 mb-6">
        <MdPrecisionManufacturing className="text-blue-400 text-2xl" />
        <span className="text-white font-bold text-lg leading-tight">
          LumiQuality<span className="text-blue-400"> AI</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="text-lg" />
            {label}
          </NavLink>
        ))}

        {(isAdmin || isManager) && (
          <>
            <p className="text-xs text-slate-500 uppercase tracking-wider px-4 mt-4 mb-1">
              Administration
            </p>
            {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon className="text-lg" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
};
