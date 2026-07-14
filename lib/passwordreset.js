const { createHash } = require("crypto");

const DEFAULT_FRONTEND_URL = "https://blogdarwin.vercel.app";

function resetError(message, status = 400, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function hashResetToken(token) {
  return createHash("sha256").update(String(token || "")).digest("hex");
}

function validatePassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw resetError("La contraseña debe tener al menos 8 caracteres", 400, "INVALID_PASSWORD");
  }
  if (password.length > 128) {
    throw resetError("La contraseña no puede superar 128 caracteres", 400, "INVALID_PASSWORD");
  }
  return password;
}

function getFrontendUrl(value) {
  const configured = String(value || DEFAULT_FRONTEND_URL).trim();
  try {
    const url = new URL(configured);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Protocolo inválido");
    return url.href.replace(/\/+$/, "");
  } catch {
    return DEFAULT_FRONTEND_URL;
  }
}

module.exports = {
  resetError,
  hashResetToken,
  validatePassword,
  getFrontendUrl,
};
