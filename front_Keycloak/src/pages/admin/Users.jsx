import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import { getUsers, deleteUser, resetPassword } from '../../api/statsApi';
import { Layout } from '../../components/Layout';
import { MdPeople, MdDelete, MdLockReset, MdClose, MdRefresh, MdPerson } from 'react-icons/md';
import { Spinner } from '../../components/Spinner';

const ROLE_BADGE = {
  admin:    'bg-red-100 text-red-700',
  manager:  'bg-blue-100 text-blue-700',
  operator: 'bg-green-100 text-green-700',
};
const KNOWN_ROLES = ['admin', 'manager', 'operator'];

const Avatar = ({ username }) => (
  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
    <span className="text-white text-xs font-bold">
      {username ? username.slice(0, 2).toUpperCase() : '?'}
    </span>
  </div>
);

export const Users = () => {
  const axios = useAxiosPrivate();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [resetModal, setResetModal] = useState(null);
  const [newPwd, setNewPwd]     = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true); setError('');
    try {
      const res = await getUsers(axios);
      setUsers(res.data);
    } catch {
      setError('Impossible de charger les utilisateurs. Vérifiez les identifiants admin Keycloak dans le .env du backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (u) => {
    if (!confirm(`Supprimer l'utilisateur ${u.username} ?`)) return;
    try {
      await deleteUser(axios, u.id);
      setActionMsg(`Utilisateur ${u.username} supprimé.`);
      fetchUsers();
    } catch {
      setActionMsg('Erreur lors de la suppression.');
    }
  };

  const handleReset = async () => {
    if (!newPwd.trim()) return;
    try {
      await resetPassword(axios, resetModal.id, newPwd);
      setActionMsg(`Mot de passe de ${resetModal.username} réinitialisé.`);
      setResetModal(null); setNewPwd('');
    } catch {
      setActionMsg('Erreur lors de la réinitialisation.');
    }
  };

  return (
    <Layout title="Gestion des utilisateurs">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <p className="text-slate-500 text-sm">
          {users.length} utilisateur{users.length !== 1 ? 's' : ''} dans le realm Keycloak
        </p>
        <button onClick={fetchUsers} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
          <MdRefresh className="text-base" /> Actualiser
        </button>
      </div>

      {/* Notifications */}
      {actionMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex justify-between items-center gap-2">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')}><MdClose className="text-base" /></button>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 flex justify-center shadow-sm border border-slate-200">
          <Spinner size="md" label="Chargement des utilisateurs…" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-400 text-sm shadow-sm border border-slate-200">
          Aucun utilisateur.
        </div>
      ) : (
        <>
          {/* ── MOBILE: card list ── */}
          <div className="block md:hidden space-y-2">
            {users.map(u => {
              const appRoles = (u.realmRoles || []).filter(r => KNOWN_ROLES.includes(r));
              return (
                <div key={u.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Avatar username={u.username} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{u.username}</p>
                          {(u.firstName || u.lastName) && (
                            <p className="text-xs text-slate-400">{u.firstName} {u.lastName}</p>
                          )}
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${
                          u.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.enabled ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      {u.email && (
                        <p className="text-xs text-slate-500 mt-1 truncate">{u.email}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {appRoles.length > 0 ? appRoles.map(r => (
                          <span key={r} className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[r] || 'bg-slate-100 text-slate-600'}`}>
                            {r}
                          </span>
                        )) : <span className="text-slate-400 text-xs">Aucun rôle</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => { setResetModal(u); setNewPwd(''); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors font-medium"
                    >
                      <MdLockReset /> Réinitialiser
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium"
                    >
                      <MdDelete /> Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP: table ── */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Utilisateur</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Rôles</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Statut</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const appRoles = (u.realmRoles || []).filter(r => KNOWN_ROLES.includes(r));
                    return (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar username={u.username} />
                            <div>
                              <p className="font-medium text-slate-800">{u.username}</p>
                              {(u.firstName || u.lastName) && (
                                <p className="text-xs text-slate-400">{u.firstName} {u.lastName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm">{u.email || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {appRoles.length > 0 ? appRoles.map(r => (
                              <span key={r} className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[r] || 'bg-slate-100 text-slate-600'}`}>
                                {r}
                              </span>
                            )) : <span className="text-slate-400 text-xs">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {u.enabled ? 'Actif' : 'Désactivé'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => { setResetModal(u); setNewPwd(''); }}
                              title="Réinitialiser le mot de passe"
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                            >
                              <MdLockReset className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(u)}
                              title="Supprimer"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <MdDelete className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Reset password modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl p-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Réinitialiser le mot de passe</h3>
              <button onClick={() => setResetModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <MdClose className="text-xl" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Utilisateur : <strong className="text-slate-800">{resetModal.username}</strong>
            </p>
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="w-full border border-slate-300 rounded-xl px-3 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-sm transition-colors"
              >
                Confirmer
              </button>
              <button
                onClick={() => setResetModal(null)}
                className="flex-1 border border-slate-300 text-slate-600 py-3 rounded-xl text-sm hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
