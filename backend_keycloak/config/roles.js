// Middleware de vérification des rôles Keycloak (realm roles)
export const requireRole = (...roles) => (req, res, next) => {
  const tokenRoles = req.kauth?.grant?.access_token?.content?.realm_access?.roles || [];
  const hasRole = roles.some(r => tokenRoles.includes(r));
  if (!hasRole) {
    return res.status(403).json({ error: `Accès refusé. Rôle requis : ${roles.join(' ou ')}.` });
  }
  next();
};
