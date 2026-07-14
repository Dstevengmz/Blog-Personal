const AuthService = require("../services/usuarioautenticacionservice");

const publicUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  email: user.email,
  rol: user.rol,
});

class AutenticacionController {
  static async registrar(req, res) {
    try {
      const user = await AuthService.registrar(req.body);
      res.status(201).json({ mensaje: "Usuario creado", user: publicUser(user) });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async iniciarsesion(req, res) {
    try {
      const { user, token } = await AuthService.iniciarsesion(req.body);
      res.json({ mensaje: "Login exitoso", token, user: publicUser(user) });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async solicitarRecuperacion(req, res) {
    const genericMessage = "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.";
    try {
      await AuthService.solicitarRecuperacion(req.body || {});
    } catch (error) {
      if (error.code === "INVALID_EMAIL") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Error al solicitar recuperación:", error.code || "PASSWORD_RESET_REQUEST_ERROR", error.details || error.message);
    }
    return res.json({ mensaje: genericMessage });
  }

  static async restablecerContrasena(req, res) {
    try {
      await AuthService.restablecerContrasena(req.body || {});
      res.json({ mensaje: "Contraseña actualizada correctamente" });
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.status === 400
          ? error.message
          : "No fue posible actualizar la contraseña. Intenta nuevamente.",
      });
    }
  }
}

module.exports = AutenticacionController;
