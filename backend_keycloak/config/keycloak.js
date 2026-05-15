// keycloak.js
import session from 'express-session';
import Keycloak from 'keycloak-connect';

const memoryStore = new session.MemoryStore();

const keycloakConfig = {
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'IA_indus',
  bearerOnly: true,
  serverUrl: process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8081/',
  realm: process.env.KEYCLOAK_REALM || 'IA_Indus',
};

const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

export { keycloak, memoryStore };