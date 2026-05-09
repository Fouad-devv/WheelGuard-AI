import axios from 'axios';
import AuditLog from '../models/AuditLog.js';

const KC_URL   = process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8081';
const KC_REALM = process.env.KEYCLOAK_REALM      || 'IA_Indus';
const ADMIN_USER = process.env.KEYCLOAK_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';

async function getAdminToken() {
  const { data } = await axios.post(
    `${KC_URL}/realms/master/protocol/openid-connect/token`,
    new URLSearchParams({
      grant_type: 'password',
      client_id:  'admin-cli',
      username:   ADMIN_USER,
      password:   ADMIN_PASS,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 8000 }
  );
  return data.access_token;
}

function adminHeaders(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// GET /api/users
export const getUsers = async (req, res) => {
  try {
    const token = await getAdminToken();
    const { data: users } = await axios.get(
      `${KC_URL}/admin/realms/${KC_REALM}/users?max=100`,
      { headers: adminHeaders(token) }
    );

    // Enrich with roles
    const enriched = await Promise.all(users.map(async u => {
      try {
        const { data: roles } = await axios.get(
          `${KC_URL}/admin/realms/${KC_REALM}/users/${u.id}/role-mappings/realm`,
          { headers: adminHeaders(token) }
        );
        return { ...u, realmRoles: roles.map(r => r.name) };
      } catch {
        return { ...u, realmRoles: [] };
      }
    }));

    return res.json(enriched);
  } catch (err) {
    console.error('getUsers error:', err.message);
    return res.status(500).json({ error: 'Impossible de récupérer les utilisateurs Keycloak.' });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const token = await getAdminToken();
    await axios.delete(
      `${KC_URL}/admin/realms/${KC_REALM}/users/${req.params.id}`,
      { headers: adminHeaders(token) }
    );

    AuditLog.create({
      userId: req.userId, username: req.username,
      action: 'DELETE_USER', resource: 'user',
      details: { targetUserId: req.params.id },
      ipAddress: req.ip,
    }).catch(() => {});

    return res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    return res.status(500).json({ error: 'Impossible de supprimer cet utilisateur.' });
  }
};

// POST /api/users
export const createUser = async (req, res) => {
  const { username, email, firstName, lastName, password, role } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });

  try {
    const token = await getAdminToken();

    // 1 — Create the user
    const createResp = await axios.post(
      `${KC_URL}/admin/realms/${KC_REALM}/users`,
      {
        username,
        email:         email      || undefined,
        firstName:     firstName  || undefined,
        lastName:      lastName   || undefined,
        enabled:       true,
        emailVerified: true,
      },
      { headers: adminHeaders(token) }
    );

    // Keycloak returns the new user ID in the Location header
    const location = createResp.headers['location'] || '';
    const newUserId = location.split('/').pop();

    // 2 — Set password
    await axios.put(
      `${KC_URL}/admin/realms/${KC_REALM}/users/${newUserId}/reset-password`,
      { type: 'password', value: password, temporary: false },
      { headers: adminHeaders(token) }
    );

    // 3 — Assign role
    if (role && ['operator', 'manager', 'admin'].includes(role)) {
      const { data: roleData } = await axios.get(
        `${KC_URL}/admin/realms/${KC_REALM}/roles/${role}`,
        { headers: adminHeaders(token) }
      );
      await axios.post(
        `${KC_URL}/admin/realms/${KC_REALM}/users/${newUserId}/role-mappings/realm`,
        [{ id: roleData.id, name: roleData.name }],
        { headers: adminHeaders(token) }
      );
    }

    AuditLog.create({
      userId: req.userId, username: req.username,
      action: 'CREATE_USER', resource: 'user',
      details: { newUsername: username, role },
      ipAddress: req.ip,
    }).catch(() => {});

    return res.status(201).json({ message: `Utilisateur ${username} créé avec succès.` });
  } catch (err) {
    if (err.response?.status === 409)
      return res.status(409).json({ error: 'Ce nom d\'utilisateur existe déjà.' });
    console.error('createUser error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Impossible de créer l\'utilisateur.' });
  }
};

// PUT /api/users/:id/reset-password
export const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: 'Nouveau mot de passe requis.' });
  try {
    const token = await getAdminToken();
    await axios.put(
      `${KC_URL}/admin/realms/${KC_REALM}/users/${req.params.id}/reset-password`,
      { type: 'password', value: newPassword, temporary: false },
      { headers: adminHeaders(token) }
    );

    AuditLog.create({
      userId: req.userId, username: req.username,
      action: 'RESET_PASSWORD', resource: 'user',
      details: { targetUserId: req.params.id },
      ipAddress: req.ip,
    }).catch(() => {});

    return res.json({ message: 'Mot de passe réinitialisé.' });
  } catch (err) {
    return res.status(500).json({ error: 'Impossible de réinitialiser le mot de passe.' });
  }
};
