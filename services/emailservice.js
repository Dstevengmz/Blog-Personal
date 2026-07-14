const https = require("https");
const { randomUUID } = require("crypto");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_HOST = "api.resend.com";
const DEFAULT_FROM = "Darwin Steven Gómez <onboarding@resend.dev>";

function publicError(message, status = 500, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function cleanHeader(value, maxLength = 200) {
  return String(value || "").trim().slice(0, maxLength).replace(/[\r\n]+/g, " ");
}

function removeWrappingQuotes(value) {
  const text = cleanHeader(value);
  const hasDoubleQuotes = text.startsWith('"') && text.endsWith('"');
  const hasSingleQuotes = text.startsWith("'") && text.endsWith("'");
  return hasDoubleQuotes || hasSingleQuotes ? text.slice(1, -1).trim() : text;
}

function normalizeSender(value) {
  const sender = removeWrappingQuotes(value);
  if (EMAIL_PATTERN.test(sender)) return sender;

  const match = sender.match(/^([^<>]+)\s*<([^<>\s]+)>$/);
  if (match && EMAIL_PATTERN.test(match[2])) {
    return `${match[1].trim()} <${match[2].toLowerCase()}>`;
  }
  return DEFAULT_FROM;
}

function resendError(statusCode, response) {
  const details = response?.message || response?.name || "Error desconocido de Resend";
  let message = "No fue posible enviar el correo. Inténtalo nuevamente.";
  let status = 502;

  if (statusCode === 401) message = "El servicio de correo no está autorizado.";
  if (statusCode === 403) message = "El remitente de Resend no está autorizado.";
  if (statusCode === 422) message = "Resend rechazó la información del correo.";
  if (statusCode === 429) {
    message = "El servicio de correo alcanzó temporalmente su límite.";
    status = 503;
  }

  const error = publicError(message, status, `RESEND_${statusCode}`);
  error.details = details;
  return error;
}

function requestResend(apiKey, payload) {
  const body = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: RESEND_HOST,
        port: 443,
        path: "/emails",
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "Idempotency-Key": `email/${randomUUID()}`,
        },
      },
      (response) => {
        let rawBody = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => { rawBody += chunk; });
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

async function sendEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw publicError("El servicio de correo no está configurado.", 500, "RESEND_NOT_CONFIGURED");
  }

  const from = normalizeSender(process.env.RESEND_FROM || DEFAULT_FROM);
  return requestResend(apiKey, { ...payload, from });
}

module.exports = {
  sendEmail,
  EMAIL_PATTERN,
  _test: { normalizeSender, removeWrappingQuotes },
};
