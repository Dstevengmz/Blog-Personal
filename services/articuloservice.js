const { Articulo, Imagen } = require('../models'); 
const cloudinary = require('./cloudinary');
const stream = require('stream');

class ArticuloService {
    static async obtenerArticulos() {
        try {
            return await Articulo.findAll({
                include: [{ model: Imagen, as: 'imagenes' }]
            });
        } catch (error) {
            console.log("Error al obtener articulos:", error);
        }
    }

    static async createImagen(data, files) {
        const articulo = await Articulo.create(data);
        if (files && files.length > 0) {
            const uploaded = [];
            for (const file of files) {
                const cloudUrl = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'blogpersonal/articulos' },
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
                uploaded.push({ url: cloudUrl, idArticulo: articulo.id });
            }
            if (uploaded.length) await Imagen.bulkCreate(uploaded);
        }
        return await Articulo.findByPk(articulo.id, {
            include: [{ model: Imagen, as: 'imagenes' }]
        });
    }

    static async crearArticulo(idUsuario, titulo,contenido,slug,imagen,tags) {
        try {
            return await Articulo.create({ idUsuario, titulo,contenido,slug,imagen,tags });
        } catch (e) {
            console.log("Error en el servidor al guardar la reserva:", e);
        }
    }

    static async eliminarArticulo(id) {
        try {
            let resultadoB = await Articulo.findByPk(id);
            if (resultadoB) {
                await resultadoB.destroy();
                return true;
            } else {
                console.log("Articulo no encontrado.");
                return false;
            }
        } catch (e) {
            console.log("Error en el servidor al eliminar Articulo:", e);
            return false;
        }
    }

    static async actualizarArticulo(id, datos) {
        try {
            let actualizado = await Articulo.update(datos, { where: { id } });
            return actualizado;
        } catch (e) {
            console.log("Error en el servidor al actualizar Articulo:", e);
        }
    }
    static async obtenerArticuloPorId(id) {
        try {
            return await Articulo.findByPk(id, {
                include: [{ model: Imagen, as: 'imagenes' }]
            });
        } catch (error) {
            console.log("Error al obtener Articulo por ID:", error);
        }
    }
}

module.exports = ArticuloService;