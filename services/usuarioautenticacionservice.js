const { Usuario } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { Op } = require("sequelize");
const { sendEmail, EMAIL_PATTERN } = require("./emailservice");
const {
  resetError,
  hashResetToken,
  validatePassword,
  getFrontendUrl,
} = require("../lib/passwordreset");

const SECRET = process.env.JWT_SECRET;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

class AutenticacionService {

  static async registrar({ nombre, email, password, rol }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      rol: rol && ["admin", "visitante"].includes(rol) ? rol : "visitante",
    });
  }

  static async iniciarsesion({ email, password }) {
    const user = await Usuario.unscoped().findOne({ where: { email } });
    if (!user) throw new Error("Usuario no encontrado");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Contraseña incorrecta");
    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      SECRET,
      { expiresIn: "2h" }
    );

    return { user, token };
  }

  static async solicitarRecuperacion({ email }) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      throw resetError("El correo electrónico no es válido", 400, "INVALID_EMAIL");
    }

    const user = await Usuario.unscoped().findOne({
      where: { email: normalizedEmail },
    });
    if (!user) return;

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.update({
      passwordResetToken: tokenHash,
      passwordResetExpires: expiresAt,
    });

    const resetUrl = `${getFrontendUrl(process.env.FRONTEND_URL)}/restablecer-contrasena/${token}`;
    try {
      await sendEmail({
        to: [user.email],
        subject: "Restablece tu contraseña de BlogDarwin",
        text: [
          "Recibimos una solicitud para restablecer tu contraseña de BlogDarwin.",
          `Abre este enlace durante los próximos 30 minutos: ${resetUrl}`,
          "Si no realizaste esta solicitud, puedes ignorar este correo.",
        ].join("\n\n"),
        html: [
          "<h2>Restablecer contraseña</h2>",
          "<p>Recibimos una solicitud para restablecer tu contraseña de BlogDarwin.</p>",
          `<p><a href="${resetUrl}">Crear una contraseña nueva</a></p>`,
          "<p>Este enlace vence en 30 minutos y solo puede utilizarse una vez.</p>",
          "<p>Si no realizaste esta solicitud, puedes ignorar este correo.</p>",
        ].join(""),
      });
    } catch (error) {
      await user.update({ passwordResetToken: null, passwordResetExpires: null });
      throw error;
    }
  }

  static async restablecerContrasena({ token, password }) {
    const rawToken = String(token || "").trim();
    if (!/^[a-f0-9]{64}$/i.test(rawToken)) {
      throw resetError("El enlace de recuperación no es válido o ya venció", 400, "INVALID_RESET_TOKEN");
    }
    validatePassword(password);

    const hashedPassword = await bcrypt.hash(password, 10);
    const [updatedUsers] = await Usuario.unscoped().update(
      {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
      {
        where: {
          passwordResetToken: hashResetToken(rawToken),
          passwordResetExpires: { [Op.gt]: new Date() },
        },
      }
    );
    if (updatedUsers !== 1) {
      throw resetError("El enlace de recuperación no es válido o ya venció", 400, "INVALID_RESET_TOKEN");
    }
  }
}

module.exports = AutenticacionService;
