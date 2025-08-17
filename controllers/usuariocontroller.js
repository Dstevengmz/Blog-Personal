const UsuarioService = require("../services/usuarioservice");

class UsuarioController {
	static async listarUsuario(req, res) {
		try {
			let lista = await UsuarioService.obtenerUsuarios();
			res.json(lista);
		} catch (e) {
			res.status(500).json({ error: "Error en la petición" });
		}
	}

	static async crearUsuario(req, res) {
		try {
			let { nombre, email, password, rol } = req.body;
			let usuario = await UsuarioService.crearUsuario(
				nombre,
				email,
				password,
				rol
			);
			res.json(usuario);
		} catch (e) {
			res.status(500).json({ error: "Error en la petición" });
		}
	}

	static async eliminarUsuario(req, res) {
		try {
			const { id } = req.params;
			if (isNaN(id)) {
				return res.status(400).json({ error: "ID inválido" });
			}
			let resultado = await UsuarioService.eliminarUsuario(id);

			if (!resultado) {
				return res.status(404).json({ error: "Usuario no encontrado" });
			}
			res.json({ mensaje: "Usuario eliminado correctamente" });
		} catch (e) {
			res.status(500).json({ error: "Error en el servidor al eliminar Usuario" });
		}
	}

	static async actualizarUsuario(req, res) {
		try {
			const { id } = req.params;
			const { nombre, email, password, rol } = req.body;

			if (isNaN(id)) {
				return res.status(400).json({ error: "ID inválido" });
			}

			let resultado = await UsuarioService.actualizarUsuario(id, {
				nombre,
				email,
				password,
				rol,
			});

			if (!resultado[0]) {
				return res.status(404).json({ error: "Usuario no encontrado" });
			}

			res.json({ mensaje: "Usuario actualizado correctamente" });
		} catch (e) {
			res.status(500).json({ error: "Error en el servidor al actualizar Usuario" });
		}
	}

	static async obtenerUsuarioPorId(req, res) {
		try {
			const { id } = req.params;
			if (isNaN(id)) {
				return res.status(400).json({ error: "ID inválido" });
			}
			let usuario = await UsuarioService.obtenerUsuarioPorId(id);
			if (!usuario) {
				return res.status(404).json({ error: "Usuario no encontrado" });
			}
			res.json(usuario);
		} catch (e) {
			res.status(500).json({ error: "Error al obtener Usuario por ID" });
		}
	}
}

module.exports = UsuarioController;
