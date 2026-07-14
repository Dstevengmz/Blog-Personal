const { sendEmail, EMAIL_PATTERN } = require("./emailservice");

function publicError(message, status = 500, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanHeader(value, maxLength) {
  return cleanText(value, maxLength).replace(/[\r\n]+/g, " ");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailPayload({ nombre, email, asunto, mensaje }, { to }) {
  const safeName = cleanHeader(nombre, 80);
  const safeEmail = cleanHeader(email, 160).toLowerCase();
  const safeSubject = cleanHeader(asunto, 120);
  const safeMessage = cleanText(mensaje, 2000);

  if (safeName.length < 2) throw publicError("El nombre debe tener al menos 2 caracteres", 400, "INVALID_NAME");
  if (!EMAIL_PATTERN.test(safeEmail)) throw publicError("El correo electrónico no es válido", 400, "INVALID_EMAIL");
  if (safeMessage.length < 10) throw publicError("El mensaje debe tener al menos 10 caracteres", 400, "INVALID_MESSAGE");

  const escapedMessage = escapeHtml(safeMessage).replace(/\n/g, "<br>");
  return {
    to: [to],
    reply_to: safeEmail,
    subject: safeSubject ? `Contacto BlogDarwin: ${safeSubject}` : "Nuevo mensaje desde BlogDarwin",
    text: `Nombre: ${safeName}\nCorreo: ${safeEmail}\n\n${safeMessage}`,
    html: [
      "<h2>Nuevo mensaje desde BlogDarwin</h2>",
      `<p><strong>Nombre:</strong> ${escapeHtml(safeName)}</p>`,
      `<p><strong>Correo:</strong> ${escapeHtml(safeEmail)}</p>`,
      `<p><strong>Mensaje:</strong></p><p>${escapedMessage}</p>`,
    ].join(""),
  };
}

async function enviar(contact) {
  const to = cleanHeader(process.env.CONTACT_EMAIL, 160);
  if (!EMAIL_PATTERN.test(to)) {
    throw publicError("El destinatario del formulario no está configurado.", 500, "CONTACT_EMAIL_NOT_CONFIGURED");
  }
  const response = await sendEmail(buildEmailPayload(contact, { to }));
  return { messageId: response.id };
}

module.exports = { enviar, _test: { buildEmailPayload, escapeHtml } };
