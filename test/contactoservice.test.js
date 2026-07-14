const test = require("node:test");
const assert = require("node:assert/strict");
const { _test } = require("../services/contactoservice");
const { _test: emailTest } = require("../services/emailservice");

test("construye un correo seguro con reply_to", () => {
  const payload = _test.buildEmailPayload(
    {
      nombre: "Darwin <script>",
      email: "PERSONA@EXAMPLE.COM",
      asunto: "Oportunidad\r\ninyección",
      mensaje: "Hola <script>alert('x')</script>",
    },
    {
      to: "destino@example.com",
    }
  );

  assert.deepEqual(payload.to, ["destino@example.com"]);
  assert.equal(payload.reply_to, "persona@example.com");
  assert.equal(payload.subject, "Contacto BlogDarwin: Oportunidad inyección");
  assert.equal(payload.html.includes("<script>"), false);
  assert.equal(payload.html.includes("&lt;script&gt;"), true);
});

test("rechaza direcciones de correo inválidas", () => {
  assert.throws(
    () => _test.buildEmailPayload(
      { nombre: "Persona", email: "correo-invalido", mensaje: "Mensaje suficientemente largo" },
      { to: "destino@example.com" }
    ),
    { code: "INVALID_EMAIL", status: 400 }
  );
});

test("normaliza un remitente copiado con comillas desde Render", () => {
  assert.equal(
    emailTest.normalizeSender('"Darwin Steven Gómez <onboarding@resend.dev>"'),
    "Darwin Steven Gómez <onboarding@resend.dev>"
  );
});

test("usa el remitente seguro cuando la configuración es inválida", () => {
  assert.equal(
    emailTest.normalizeSender("RESEND_FROM=valor incorrecto"),
    "Darwin Steven Gómez <onboarding@resend.dev>"
  );
});
