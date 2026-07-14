const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/autenticacioncontroller");
const rateLimit = require("express-rate-limit");

const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Espera 15 minutos antes de volver a intentarlo." },
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Espera 15 minutos antes de volver a intentarlo." },
});

router.post("/registrar", AuthController.registrar);
router.post("/iniciarsesion", AuthController.iniciarsesion);
router.post("/recuperar-contrasena", recoveryLimiter, AuthController.solicitarRecuperacion);
router.post("/restablecer-contrasena", resetLimiter, AuthController.restablecerContrasena);

module.exports = router;
