const express = require('express');
const ProyectoController = require('../controllers/proyectocontroller');
const upload = require('../middlewares/upload');
const router = express.Router();
const autenticacionmiddlewar = require("../middlewares/autenticacionmiddlewar");
const rolmiddlewar = require("../middlewares/rolmiddlewar");
const propietarioProyecto = require("../middlewares/propietarioproyecto");

router.get('/listarproyectos', ProyectoController.listarProyecto);
// Crear proyecto: sólo admin
router.post('/agregaproyecto', autenticacionmiddlewar, rolmiddlewar(['admin']), ProyectoController.crearProyecto);
router.delete('/eliminarproyecto/:id', autenticacionmiddlewar, propietarioProyecto, ProyectoController.eliminarProyecto);
router.put('/editarproyecto/:id', autenticacionmiddlewar, rolmiddlewar(['admin']), propietarioProyecto, upload.array('imagenes', 10), ProyectoController.actualizarProyecto);

router.get('/buscarproyecto/:id', ProyectoController.obtenerProyectoPorId);
// Subida de imágenes de proyecto: sólo admin
router.post('/imagen', autenticacionmiddlewar, rolmiddlewar(['admin']), upload.array('imagenes', 10), ProyectoController.createimagen);

module.exports = router;
