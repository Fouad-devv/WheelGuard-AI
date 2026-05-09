import { useKeycloak } from '@react-keycloak/web';
import { useRole } from '../hooks/useRole';
import { MdLogout, MdPerson } from 'react-icons/md';

const ROLE_LABELS = { admin: 'Administrateur', manager: 'Manager', operator: 'Opérateur' };

export const Topbar = ({ title }) => {
  const { keycloak } = useKeycloak();
  const { username, roles } = useRole();

  const displayRole = roles.find(r => ROLE_LABELS[r]) || roles[0] || '';

  const handleLogout = () => keycloak.logout({ redirectUri: window.location.origin });

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-slate-700 font-semibold text-base">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MdPerson className="text-blue-500 text-xl" />
          <span className="font-medium">{username}</span>
          {displayRole && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {ROLE_LABELS[displayRole] || displayRole}
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors"
        >
          <MdLogout className="text-lg" />
          Déconnexion
        </button>
      </div>
    </header>
  );
};
