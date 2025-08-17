const express = require('express');
const ArticuloRouter = require('../controllers/articulocontroller');
const upload = require('../middlewares/upload');
const autenticacionmiddlewar = require("../middlewares/autenticacionmiddlewar");
const propietarioArticulo = require("../middlewares/propietarioarticulo");
const rolmiddlewar = require("../middlewares/rolmiddlewar");
const router = express.Router();

router.get('/listararticulos', ArticuloRouter.listarArticulo);
router.post('/agregaarticulo', autenticacionmiddlewar, rolmiddlewar(['admin']), ArticuloRouter.crearArticulo);
router.delete('/eliminararticulo/:id', autenticacionmiddlewar, propietarioArticulo, ArticuloRouter.eliminarArticulo);
router.put('/editararticulo/:id', autenticacionmiddlewar, propietarioArticulo, ArticuloRouter.actualizarArticulo);
router.get('/buscararticulo/:id', ArticuloRouter.obtenerArticuloPorId);
router.post('/imagenarticulo', autenticacionmiddlewar, rolmiddlewar(['admin']), upload.array('imagenes', 5), ArticuloRouter.createimagen);

module.exports = router;