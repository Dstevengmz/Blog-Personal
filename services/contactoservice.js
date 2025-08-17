const nodemailer = require('nodemailer');

function buildTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
}

async function enviar({ nombre, email, asunto, mensaje }) {
  const to = process.env.CONTACT_EMAIL;
  if (!to) {
    const e = new Error('No hay destinatario configurado (CONTACT_EMAIL/SMTP_USER)');
    e.status = 500;
    throw e;
  }
  const transporter = buildTransporter();
  const info = await transporter.sendMail({
    from: `${nombre} <${email}>`,
    to,
    subject: asunto || 'Nuevo mensaje desde el formulario de contacto',
    text: mensaje,
    html: `<p>${String(mensaje || '').replace(/\n/g, '<br/>')}</p>`
  });
  return info;
}

module.exports = { enviar };
