const ComentarioService = require('../services/comentarioservice');

class ComentarioController {
  static async crear(req, res) {
    try {
      const { contenido } = req.body;
      const { idProyecto } = req.params;
      const idUsuario = req.user?.id; 
      if (!idUsuario) return res.status(401).json({ error: 'No autenticado' });
      if (!contenido || !String(contenido).trim()) return res.status(400).json({ error: 'Contenido requerido' });
      const com = await ComentarioService.crear({ idUsuario, idProyecto, contenido });
      res.status(201).json(com);
    } catch (e) {
      res.status(500).json({ error: 'Error al crear comentario' });
    }
  }
  static async listar(req, res) {
    try {
      const { idProyecto } = req.params;
      const rows = await ComentarioService.listarPorProyecto(idProyecto);
      res.json(rows);
    } catch (e) {
        console.error(e);
      res.status(500).json({ error: 'Error al listar comentarios' });
    }
  }
}

module.exports = ComentarioController;
