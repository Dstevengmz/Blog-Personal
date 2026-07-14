const test = require("node:test");
const assert = require("node:assert/strict");

const { hashResetToken, validatePassword, getFrontendUrl } = require("../lib/passwordreset");

test("genera un hash estable sin almacenar el token original", () => {
  const token = "a".repeat(64);
  const hash = hashResetToken(token);
  assert.equal(hash.length, 64);
  assert.notEqual(hash, token);
  assert.equal(hash, hashResetToken(token));
});

test("exige una contraseña de al menos ocho caracteres", () => {
  assert.throws(
    () => validatePassword("corta"),
    { code: "INVALID_PASSWORD", status: 400 }
  );
  assert.equal(validatePassword("segura123"), "segura123");
});
