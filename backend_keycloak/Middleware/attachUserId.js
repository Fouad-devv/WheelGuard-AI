// Middleware/attachUserId.js

export const attachUserId = (req, res, next) => {
  if (req.kauth?.grant?.access_token?.content) {
    const content = req.kauth.grant.access_token.content;
    req.userId   = content.sub;
    req.username = content.preferred_username;
    req.email    = content.email;
    req.roles    = content.realm_access?.roles || [];
  }
  next();
};