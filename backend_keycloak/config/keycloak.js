// keycloak.js
import session from 'express-session';
import Keycloak from 'keycloak-connect';

const memoryStore = new session.MemoryStore();

const keycloakConfig = {
  clientId: 'IA_indus',
  bearerOnly: true, // if you only use Bearer tokens
  serverUrl: 'http://localhost:8081/',
  realm: 'IA_Indus',
};

const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

export { keycloak, memoryStore };