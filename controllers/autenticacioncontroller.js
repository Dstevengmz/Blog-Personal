const AuthService = require("../services/usuarioautenticacionservice");

class AutenticacionController {
  static async registrar(req, res) {
    try {
      const user = await AuthService.registrar(req.body);
      res.status(201).json({ mensaje: "Usuario creado", user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async iniciarsesion(req, res) {
    try {
      const { user, token } = await AuthService.iniciarsesion(req.body);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[AUTH] Token generado para ${user.email || user.id}: ${token}`);
      }
      res.json({ mensaje: "Login exitoso", token, user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = AutenticacionController;
