const { Comentario, Usuario } = require('../models');

async function crear({ idUsuario, idProyecto, contenido }) {
  return await Comentario.create({ idUsuario, idProyecto, contenido });
}

async function listarPorProyecto(idProyecto) {
  return await Comentario.findAll({
    where: { idProyecto },
    include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nombre'] }],
    order: [['createdAt', 'DESC']],
  });
}

module.exports = { crear, listarPorProyecto };
