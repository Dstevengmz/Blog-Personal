const express = require('express');
const UsuarioController = require('../controllers/usuariocontroller');
const autenticacion = require('../middlewares/autenticacionmiddlewar');
const autorizarRol = require('../middlewares/rolmiddlewar');
const router = express.Router();

// Se aplica por ruta para no interceptar otros endpoints montados bajo /api.
const soloAdministradores = [autenticacion, autorizarRol(['admin'])];

router.get('/listarusuarios', ...soloAdministradores, UsuarioController.listarUsuario);
router.post('/agregausuario', ...soloAdministradores, UsuarioController.crearUsuario);
router.delete('/eliminarusuario/:id', ...soloAdministradores, UsuarioController.eliminarUsuario);
router.put('/editarusuario/:id', ...soloAdministradores, UsuarioController.actualizarUsuario);
router.get('/buscarusuario/:id', ...soloAdministradores, UsuarioController.obtenerUsuarioPorId);

module.exports = router;
