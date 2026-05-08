// keycloak.js
import session from 'express-session';
import Keycloak from 'keycloak-connect';

const memoryStore = new session.MemoryStore();

const keycloakConfig = {
  clientId: 'myClient',
  bearerOnly: true, // if you only use Bearer tokens
  serverUrl: 'http://localhost:8081/',
  realm: 'Realm1',
};

const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

export { keycloak, memoryStore };