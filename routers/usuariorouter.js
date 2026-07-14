const express = require('express');
const UsuarioController = require('../controllers/usuariocontroller');
const autenticacion = require('../middlewares/autenticacionmiddlewar');
const autorizarRol = require('../middlewares/rolmiddlewar');
const router = express.Router();

// La administración de cuentas nunca se expone. es por seguridad. Solo los administradores pueden acceder a estas rutas.
router.use(autenticacion, autorizarRol(['admin']));

router.get('/listarusuarios', UsuarioController.listarUsuario);
router.post('/agregausuario', UsuarioController.crearUsuario);
router.delete('/eliminarusuario/:id', UsuarioController.eliminarUsuario);
router.put('/editarusuario/:id', UsuarioController.actualizarUsuario);
router.get('/buscarusuario/:id', UsuarioController.obtenerUsuarioPorId);

module.exports = router;
