const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

class UsuarioService {
	static async obtenerUsuarios() {
		try {
			return await Usuario.findAll();
		} catch (error) {
			console.log("Error al obtener usuarios:", error);
		}
	}

	static async crearUsuario(nombre, email, password, rol) {
		try {
			const hashed = await bcrypt.hash(password, 10);
			return await Usuario.create({ nombre, email, password: hashed, rol });
		} catch (e) {
			console.log("Error en el servidor al guardar el usuario:", e);
		}
	}

	static async eliminarUsuario(id) {
		try {
			let resultadoB = await Usuario.findByPk(id);
			if (resultadoB) {
				await resultadoB.destroy();
			} else {
				console.log("Usuario no encontrado.");
			}
		} catch (e) {
			console.log("Error en el servidor al eliminar Usuario:", e);
		}
	}

	static async actualizarUsuario(id, datos) {
		try {
			let actualizado = await Usuario.update(datos, { where: { id } });
			return actualizado;
		} catch (e) {
			console.log("Error en el servidor al actualizar Usuario:", e);
		}
	}

	static async obtenerUsuarioPorId(id) {
		try {
			return await Usuario.findByPk(id);
		} catch (error) {
			console.log("Error al obtener Usuario por ID:", error);
		}
	}
}

module.exports = UsuarioService;
