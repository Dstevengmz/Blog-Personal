const ProyectoService = require("../services/proyectoservice");
class ProyectoController {
  static async listarProyecto(req, res) {
    try {
      let lista = await ProyectoService.obtenerProyectos();
      res.json(lista);
    } catch (e) {
      res.status(500).json({ error: "Error en la petición" });
    }
  }
  static async createimagen(req, res) {
    try {
      const data = req.body;
      const files = req.files;

      const nuevoProyecto = await ProyectoService.createImagen(data, files);
      res.status(201).json(nuevoProyecto);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async crearProyecto(req, res) {
    try {
      let { idUsuario, titulo, descripcion, github, demoUrl, imagen } =
        req.body;
      let proyecto = await ProyectoService.crearProyecto(
        idUsuario,
        titulo,
        descripcion,
        github,
        demoUrl,
        imagen
      );
      res.json(proyecto);
    } catch (e) {
      res.status(500).json({ error: "Error en la petición" });
    }
  }

  static async eliminarProyecto(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      let resultado = await ProyectoService.eliminarProyecto(id);

      if (!resultado) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }
      res.json({ mensaje: "Proyecto eliminado correctamente" });
    } catch (e) {
      res
        .status(500)
        .json({ error: "Error en el servidor al eliminar Proyecto" });
    }
  }

  static async actualizarProyecto(req, res) {
    try {
      const { id } = req.params;
      const { idUsuario, titulo, descripcion, github, demoUrl, imagen } =
        req.body;

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      let resultado = await ProyectoService.actualizarProyecto(id, {
        idUsuario,
        titulo,
        descripcion,
        github,
        demoUrl,
        imagen,
      });

      if (!resultado[0]) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      res.json({ mensaje: "Proyecto actualizado correctamente" });
    } catch (e) {
      res
        .status(500)
        .json({ error: "Error en el servidor al actualizar Proyecto" });
    }
  }

  static async obtenerProyectoPorId(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      let proyecto = await ProyectoService.obtenerProyectoPorId(id);
      if (!proyecto) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }
      res.json(proyecto);
    } catch (e) {
      res.status(500).json({ error: "Error al obtener Proyecto por ID" });
    }
  }
}

module.exports = ProyectoController;
