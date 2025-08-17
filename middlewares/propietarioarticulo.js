const { Articulo } = require("../models");

async function propietarioArticulo(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    const { id } = req.params;
    const articulo = await Articulo.findByPk(id);
    if (!articulo) return res.status(404).json({ error: "Articulo no encontrado" });
    if (req.user.rol === "admin" || articulo.idUsuario === req.user.id) {
      return next();
    }
    return res.status(403).json({ error: "No tienes permisos" });
  } catch (e) {
    return res.status(500).json({ error: "Error verificando propietario" });
  }
}

module.exports = propietarioArticulo;
