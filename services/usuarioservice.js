const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const { EMAIL_PATTERN } = require('./emailservice');
const { resetError, validatePassword } = require('../lib/passwordreset');

function normalizeUserData({ nombre, email, rol }, { partial = false } = {}) {
	const data = {};
	if (!partial || nombre !== undefined) {
		data.nombre = String(nombre || '').trim();
		if (data.nombre.length < 2 || data.nombre.length > 80) {
			throw resetError('El nombre debe tener entre 2 y 80 caracteres', 400, 'INVALID_NAME');
		}
	}
	if (!partial || email !== undefined) {
		data.email = String(email || '').trim().toLowerCase();
		if (!EMAIL_PATTERN.test(data.email) || data.email.length > 160) {
			throw resetError('El correo electrónico no es válido', 400, 'INVALID_EMAIL');
		}
	}
	if (!partial || rol !== undefined) {
		if (!['admin', 'visitante'].includes(rol)) {
			throw resetError('El rol no es válido', 400, 'INVALID_ROLE');
		}
		data.rol = rol;
	}
	return data;
}

class UsuarioService {
	static async obtenerUsuarios() {
		return Usuario.findAll();
	}

	static async crearUsuario(nombre, email, password, rol) {
		const data = normalizeUserData({ nombre, email, rol });
		validatePassword(password);
		const existingUser = await Usuario.unscoped().findOne({
			where: { email: data.email },
			attributes: ['id'],
		});
		if (existingUser) throw resetError('El correo ya está registrado', 409, 'EMAIL_ALREADY_EXISTS');
		data.password = await bcrypt.hash(password, 10);
		return Usuario.create(data);
	}

	static async eliminarUsuario(id) {
		const user = await Usuario.findByPk(id);
		if (!user) return false;
		await user.destroy();
		return true;
	}

	static async actualizarUsuario(id, datos) {
		const data = normalizeUserData(datos, { partial: true });
		if (data.email) {
			const existingUser = await Usuario.unscoped().findOne({
				where: { email: data.email },
				attributes: ['id'],
			});
			if (existingUser && Number(existingUser.id) !== Number(id)) {
				throw resetError('El correo ya está registrado', 409, 'EMAIL_ALREADY_EXISTS');
			}
		}
		if (datos.password !== undefined && datos.password !== '') {
			validatePassword(datos.password);
			data.password = await bcrypt.hash(datos.password, 10);
		}
		return Usuario.update(data, { where: { id } });
	}

	static async obtenerUsuarioPorId(id) {
		return Usuario.findByPk(id);
	}
}

module.exports = UsuarioService;
