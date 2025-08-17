function roleMiddleware(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (roles.length > 0 && !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "No tienes permisos" });
    }
    next();
  };
}

module.exports = roleMiddleware;
