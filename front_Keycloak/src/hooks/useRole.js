import { useKeycloak } from '@react-keycloak/web';

export const useRole = () => {
  const { keycloak } = useKeycloak();
  const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
  return {
    isOperator: roles.includes('operator') || roles.includes('manager') || roles.includes('admin'),
    isManager:  roles.includes('manager')  || roles.includes('admin'),
    isAdmin:    roles.includes('admin'),
    username:   keycloak?.tokenParsed?.preferred_username || '',
    email:      keycloak?.tokenParsed?.email || '',
    roles,
  };
};
