const express = require('express');
const rateLimit = require('express-rate-limit');
const ContactoController = require('../controllers/contactocontroller');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Has realizado demasiados intentos. Espera un minuto antes de volver a enviar.',
  },
});

router.post('/contacto', limiter, ContactoController.enviar);

module.exports = router;
