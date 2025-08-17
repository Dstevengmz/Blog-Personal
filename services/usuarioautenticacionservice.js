const { Usuario } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET; 

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
    const user = await Usuario.findOne({ where: { email } });
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
}

module.exports = AutenticacionService;
