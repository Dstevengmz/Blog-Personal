const https = require("https");
const { randomUUID } = require("crypto");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_HOST = "api.resend.com";
const RESEND_PATH = "/emails";

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

function buildEmailPayload({ nombre, email, asunto, mensaje }, { to, from }) {
  const safeName = cleanHeader(nombre, 80);
  const safeEmail = cleanHeader(email, 160).toLowerCase();
  const safeSubject = cleanHeader(asunto, 120);
  const safeMessage = cleanText(mensaje, 2000);

  if (safeName.length < 2) {
    throw publicError("El nombre debe tener al menos 2 caracteres", 400, "INVALID_NAME");
  }
  if (!EMAIL_PATTERN.test(safeEmail)) {
    throw publicError("El correo electrónico no es válido", 400, "INVALID_EMAIL");
  }
  if (safeMessage.length < 10) {
    throw publicError("El mensaje debe tener al menos 10 caracteres", 400, "INVALID_MESSAGE");
  }

  const escapedMessage = escapeHtml(safeMessage).replace(/\n/g, "<br>");

  return {
    from,
    to: [to],
    reply_to: safeEmail,
    subject: safeSubject
      ? `Contacto BlogDarwin: ${safeSubject}`
      : "Nuevo mensaje desde BlogDarwin",
    text: `Nombre: ${safeName}\nCorreo: ${safeEmail}\n\n${safeMessage}`,
    html: [
      "<h2>Nuevo mensaje desde BlogDarwin</h2>",
      `<p><strong>Nombre:</strong> ${escapeHtml(safeName)}</p>`,
      `<p><strong>Correo:</strong> ${escapeHtml(safeEmail)}</p>`,
      `<p><strong>Mensaje:</strong></p><p>${escapedMessage}</p>`,
    ].join(""),
  };
}

function resendError(statusCode, response) {
  const details = response?.message || response?.name || "Error desconocido de Resend";
  let message = "No fue posible enviar el mensaje. Inténtalo nuevamente.";
  let status = 502;

  if (statusCode === 401) message = "El servicio de contacto no está autorizado.";
  if (statusCode === 403) message = "El remitente de Resend no está autorizado. Verifica el dominio o RESEND_FROM.";
  if (statusCode === 422) message = "Resend rechazó la información del correo.";
  if (statusCode === 429) {
    message = "El servicio de correo alcanzó temporalmente su límite. Inténtalo más tarde.";
    status = 503;
  }

  const error = publicError(message, status, `RESEND_${statusCode}`);
  error.details = details;
  return error;
}

function sendWithResend(apiKey, payload) {
  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: RESEND_HOST,
        port: 443,
        path: RESEND_PATH,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "Idempotency-Key": `contact/${randomUUID()}`,
        },
      },
      (response) => {
        let rawBody = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          rawBody += chunk;
        });
        response.on("end", () => {
          let parsedBody = {};
          try {
            parsedBody = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            parsedBody = {};
          }

          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(parsedBody);
            return;
          }
          reject(resendError(response.statusCode, parsedBody));
        });
      }
    );

    request.setTimeout(15000, () => {
      request.destroy(publicError("Resend tardó demasiado en responder.", 504, "RESEND_TIMEOUT"));
    });
    request.on("error", (error) => {
      if (error.status) reject(error);
      else reject(publicError("No fue posible conectar con Resend.", 502, "RESEND_CONNECTION_ERROR"));
    });
    request.end(body);
  });
}

async function enviar(contact) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = cleanHeader(process.env.CONTACT_EMAIL, 160);
  const from = cleanHeader(
    process.env.RESEND_FROM || "BlogDarwin <onboarding@resend.dev>",
    200
  );

  if (!apiKey) {
    throw publicError("El servicio de contacto no está configurado.", 500, "RESEND_NOT_CONFIGURED");
  }
  if (!EMAIL_PATTERN.test(to)) {
    throw publicError("El destinatario del formulario no está configurado.", 500, "CONTACT_EMAIL_NOT_CONFIGURED");
  }

  const payload = buildEmailPayload(contact, { to, from });
  const response = await sendWithResend(apiKey, payload);
  return { messageId: response.id };
}

module.exports = {
  enviar,
  _test: { buildEmailPayload, escapeHtml },
};
