import jwt from 'jsonwebtoken';
import axios from 'axios';
import { createPublicKey } from 'crypto';

const CERTS_URL = `${process.env.KEYCLOAK_SERVER_URL}realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`;

let cachedKeys = {};

async function getPublicKey(kid) {
  if (cachedKeys[kid]) return cachedKeys[kid];
  const { data } = await axios.get(CERTS_URL, { timeout: 5000 });
  for (const jwk of data.keys) {
    cachedKeys[jwk.kid] = createPublicKey({ key: jwk, format: 'jwk' });
  }
  return cachedKeys[kid] || null;
}

export const keycloakAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant.' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) return res.status(401).json({ error: 'Token invalide.' });

    const pubKey = await getPublicKey(decoded.header.kid);
    if (!pubKey) return res.status(401).json({ error: 'Clé publique introuvable.' });

    // Verify signature and expiry — skip iss check (differs between local dev and Docker)
    const payload = jwt.verify(token, pubKey, { algorithms: ['RS256'] });

    req.kauth = { grant: { access_token: { content: payload } } };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
};
