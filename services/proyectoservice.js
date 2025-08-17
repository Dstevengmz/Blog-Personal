const { Proyecto, Imagen } = require("../models");
const cloudinary = require("./cloudinary");
const stream = require("stream");

class ProyectoService {
  static async obtenerProyectos() {
    try {
      return await Proyecto.findAll({
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
    imagen
  ) {
    try {
      return await Proyecto.create({
        idUsuario,
        titulo,
        descripcion,
        github,
        demoUrl,
        imagen,
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
}

module.exports = ProyectoService;
