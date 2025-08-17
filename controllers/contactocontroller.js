const ContactoService = require('../services/contactoservice');

const required = (name, value) => {
  if (!value || String(value).trim() === '') {
    const err = new Error(`El campo ${name} es obligatorio`);
    err.status = 400;
    throw err;
  }
};


class ContactoController {
  static async enviar(req, res) {
    try {
      const { nombre, email, asunto, mensaje } = req.body || {};
      required('nombre', nombre);
      required('email', email);
      required('mensaje', mensaje);

  const info = await ContactoService.enviar({ nombre, email, asunto, mensaje });

      res.json({ ok: true, messageId: info.messageId });
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({ error: err.message || 'No se pudo enviar el mensaje' });
    }
  }
}

module.exports = ContactoController;
