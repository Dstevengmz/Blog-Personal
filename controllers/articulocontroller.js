const ArticuloService = require("../services/articuloservice");

class ArticuloController {
  static async createimagen(req, res) {
    try {
      const data = req.body;
      const files = req.files;
      const nuevoArticulo = await ArticuloService.createImagen(data, files);
      res.status(201).json(nuevoArticulo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  static async listarArticulo(req, res) {
    try {
      let lista = await ArticuloService.obtenerArticulos();
      res.json(lista);
    } catch (e) {
      res.status(500).json({ error: "Error en la petición" });
    }
  }

  static async crearArticulo(req, res) {
    try {
      let { idUsuario, titulo, contenido, slug, imagen, tags } = req.body;
      let articulo = await ArticuloService.crearArticulo(
        idUsuario,
        titulo,
        contenido,
        slug,
        imagen,
        tags
      );
      res.json(articulo);
    } catch (e) {
      res.status(500).json({ error: "Error en la petición" });
    }
  }

  static async eliminarArticulo(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      let resultado = await ArticuloService.eliminarArticulo(id);

      if (!resultado) {
        return res.status(404).json({ error: "Articulo no encontrado" });
      }
      res.json({ mensaje: "Articulo eliminado correctamente" });
    } catch (e) {
      res
        .status(500)
        .json({ error: "Error en el servidor al eliminar Articulo" });
    }
  }

  static async actualizarArticulo(req, res) {
    try {
      const { id } = req.params;
      const { idUsuario, titulo, contenido, slug, imagen, tags } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      let resultado = await ArticuloService.actualizarArticulo(id, {
        idUsuario,
        titulo,
        contenido,
        slug,
        imagen,
        tags,
      });

      if (!resultado[0]) {
        return res.status(404).json({ error: "Articulo no encontrado" });
      }

      res.json({ mensaje: "Articulo actualizado correctamente" });
    } catch (e) {
      res
        .status(500)
        .json({ error: "Error en el servidor al actualizar Articulo" });
    }
  }
  static async obtenerArticuloPorId(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      let articulo = await ArticuloService.obtenerArticuloPorId(id);
      if (!articulo) {
        return res.status(404).json({ error: "Articulo no encontrado" });
      }
      res.json(articulo);
    } catch (e) {
      res.status(500).json({ error: "Error al obtener Articulo por ID" });
    }
  }
}

module.exports = ArticuloController;
