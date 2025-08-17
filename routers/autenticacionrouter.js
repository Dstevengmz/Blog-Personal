const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/autenticacioncontroller");

router.post("/registrar", AuthController.registrar);
router.post("/iniciarsesion", AuthController.iniciarsesion);

module.exports = router;
