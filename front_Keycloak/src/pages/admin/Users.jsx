import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import { getUsers, deleteUser, resetPassword } from '../../api/statsApi';
import { Layout } from '../../components/Layout';
import { MdPeople, MdDelete, MdLockReset, MdClose, MdRefresh, MdPerson } from 'react-icons/md';

const ROLE_BADGE = {
  admin:    'bg-red-100 text-red-700',
  manager:  'bg-blue-100 text-blue-700',
  operator: 'bg-green-100 text-green-700',
};
const KNOWN_ROLES = ['admin', 'manager', 'operator'];

export const Users = () => {
  const axios = useAxiosPrivate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetModal, setResetModal] = useState(null);
  const [newPwd, setNewPwd] = useState('');
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
      <div className="flex justify-between items-center mb-4">
        <p className="text-slate-500 text-sm">{users.length} utilisateurs dans le realm Keycloak</p>
        <button onClick={fetchUsers} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
          <MdRefresh /> Actualiser
        </button>
      </div>

      {actionMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex justify-between">
          {actionMsg}
          <button onClick={() => setActionMsg('')}><MdClose /></button>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400">Aucun utilisateur.</td></tr>
                ) : users.map(u => {
                  const appRoles = (u.realmRoles || []).filter(r => KNOWN_ROLES.includes(r));
                  return (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MdPerson className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{u.username}</p>
                            <p className="text-xs text-slate-400">{u.firstName} {u.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.email || '—'}</td>
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
                        <span className={`px-2 py-0.5 rounded-full text-xs ${u.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {u.enabled ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => { setResetModal(u); setNewPwd(''); }}
                            title="Réinitialiser le mot de passe"
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                          >
                            <MdLockReset className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            title="Supprimer"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
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
        )}
      </div>

      {/* Reset password modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Réinitialiser le mot de passe</h3>
              <button onClick={() => setResetModal(null)}><MdClose className="text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-3">Utilisateur : <strong>{resetModal.username}</strong></p>
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm"
              >
                Confirmer
              </button>
              <button
                onClick={() => setResetModal(null)}
                className="flex-1 border border-slate-300 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50"
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
