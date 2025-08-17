const express = require('express');
const autenticacion = require('../middlewares/autenticacionmiddlewar');
const ComentarioController = require('../controllers/comentariocontroller');
const router = express.Router();

router.get('/proyecto/:idProyecto/comentarios', ComentarioController.listar);
router.post('/proyecto/:idProyecto/comentarios', autenticacion, ComentarioController.crear);

module.exports = router;
