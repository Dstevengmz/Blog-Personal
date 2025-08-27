const { Proyecto, Imagen } = require("../models");
const cloudinary = require("./cloudinary");
const stream = require("stream");

class ProyectoService {
  static async obtenerProyectos(tipo) {
    try {
      const where = tipo ? { tipo } : undefined;
      return await Proyecto.findAll({
        where,
        include: [{ model: Imagen, as: "imagenes" }],
      });
    } catch (error) {
      console.log("Error al obtener proyectos:", error);
    }
  }
  static async createImagen(data, files) {
    const proyecto = await Proyecto.create(data);

    if (files && files.length > 0) {
      const uploaded = [];
      for (const file of files) {
        const cloudUrl = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "blogpersonal/proyectos" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          const readable = new stream.Readable();
          readable._read = () => {};
          readable.push(file.buffer);
          readable.push(null);
          readable.pipe(uploadStream);
        });
        uploaded.push({ url: cloudUrl, idProyecto: proyecto.id });
      }
      if (uploaded.length) await Imagen.bulkCreate(uploaded);
    }
    return await Proyecto.findByPk(proyecto.id, {
      include: [{ model: Imagen, as: "imagenes" }],
    });
  }

  static async crearProyecto(
    idUsuario,
    titulo,
    descripcion,
    github,
    demoUrl,
    imagen,
    tipo
  ) {
    try {
      return await Proyecto.create({
        idUsuario,
        titulo,
        descripcion,
        github,
        demoUrl,
        imagen,
        tipo,
      });
    } catch (e) {
      console.log("Error en el servidor al guardar el proyecto:", e);
    }
  }

  static async eliminarProyecto(id) {
    try {
      let resultadoB = await Proyecto.findByPk(id);
      if (resultadoB) {
        await resultadoB.destroy();
        return true;
      } else {
        console.log("Proyecto no encontrado.");
        return false;
      }
    } catch (e) {
      console.log("Error en el servidor al eliminar Proyecto:", e);
      return false;
    }
  }

  static async actualizarProyecto(id, datos) {
    try {
      let actualizado = await Proyecto.update(datos, { where: { id } });
      return actualizado;
    } catch (e) {
      console.log("Error en el servidor al actualizar Proyecto:", e);
    }
  }

  static async obtenerProyectoPorId(id) {
    try {
      return await Proyecto.findByPk(id, {
        include: [{ model: Imagen, as: "imagenes" }],
      });
    } catch (error) {
      console.log("Error al obtener Proyecto por ID:", error);
    }
  }
  static async actualizarImagenes(idProyecto, files, imagenesEliminar = []) {
    try {
      const proyecto = await Proyecto.findByPk(idProyecto, {
        include: [{ model: Imagen, as: "imagenes" }],
      });

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      const getPublicIdFromUrl = (url) => {
        try {
          const afterUpload = url.split("/upload/")[1];
          if (!afterUpload) return null;
          const noQuery = afterUpload.split("?")[0];
          const noExt = noQuery.replace(/\.[^/.]+$/, "");
          const noVersion = noExt.replace(/^v\d+\//, "");
          return noVersion;
        } catch {
          return null;
        }
      };

      const urlsAEliminar = new Set((imagenesEliminar || []).map((x) => x.url));
      for (const imagen of imagenesEliminar || []) {
        const publicId = getPublicIdFromUrl(imagen.url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (e) {
            console.warn(
              "No se pudo eliminar en Cloudinary:",
              publicId,
              e?.message
            );
          }
        }
      }

      const uploaded = [];
      for (const file of files) {
        const cloudUrl = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "blogpersonal/proyectos" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          const readable = new stream.Readable();
          readable._read = () => {};
          readable.push(file.buffer);
          readable.push(null);
          readable.pipe(uploadStream);
        });
        uploaded.push({ url: cloudUrl, idProyecto: proyecto.id });
      }

      // Mantener solo las existentes que NO fueron marcadas para eliminar
      const existentesFiltradas = (proyecto.imagenes || [])
        .map((imagen) => imagen.url)
        .filter((url) => !urlsAEliminar.has(url));

      const todasLasImagenes = [
        ...existentesFiltradas,
        ...uploaded.map((img) => img.url),
      ];
      const nuevasImagenes = todasLasImagenes.slice(0, 10);

      await Imagen.destroy({ where: { idProyecto: idProyecto } });
      const nuevasImagenesData = nuevasImagenes.map((url) => ({
        url,
        idProyecto: proyecto.id,
      }));
      await Imagen.bulkCreate(nuevasImagenesData);

      return await Proyecto.findByPk(idProyecto, {
        include: [{ model: Imagen, as: "imagenes" }],
      });
    } catch (error) {
      console.error("Error al actualizar las imágenes:", error);
      throw new Error("Error al actualizar las imágenes");
    }
  }
}

module.exports = ProyectoService;
