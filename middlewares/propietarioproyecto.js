const { Proyecto } = require("../models");

async function propietarioProyecto(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    const { id } = req.params;
    const proyecto = await Proyecto.findByPk(id);
    if (!proyecto) return res.status(404).json({ error: "Proyecto no encontrado" });
    if (req.user.rol === "admin" || proyecto.idUsuario === req.user.id) {
      return next();
    }
    return res.status(403).json({ error: "No tienes permisos" });
  } catch (e) {
    return res.status(500).json({ error: "Error verificando propietario" });
  }
}

module.exports = propietarioProyecto;
