const express = require('express');
const UsuarioController = require('../controllers/usuariocontroller');
const router = express.Router();

router.get('/listarusuarios', UsuarioController.listarUsuario);
router.post('/agregausuario', UsuarioController.crearUsuario);
router.delete('/eliminarusuario/:id', UsuarioController.eliminarUsuario);
router.put('/editarusuario/:id', UsuarioController.actualizarUsuario);
router.get('/buscarusuario/:id', UsuarioController.obtenerUsuarioPorId);

module.exports = router;
