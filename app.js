require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Articulo = require("./routers/articulorouter");
const Proyecto = require("./routers/proyectorouter");
const Usuario = require("./routers/usuariorouter");
const authRoutes = require("./routers/autenticacionrouter");
const Contactorouter = require("./routers/contactorouter");
const Comentarios = require("./routers/comentariorouter");

const app = express();
const puerto = process.env.PORT || 2100;
const defaultOrigins = ["https://blogdarwin.vercel.app"];
const configuredOrigins = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin(origin, callback) {
      const isLocalDevelopment = process.env.NODE_ENV !== "production"
        && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
      if (!origin || allowedOrigins.has(origin) || isLocalDevelopment) {
        callback(null, true);
        return;
      }
      callback(new Error("Origen no permitido por CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "512kb" }));

app.use("/api", Articulo);
app.use("/api", Proyecto);
app.use("/api", Usuario);
app.use("/api/auth", authRoutes);
app.use("/api", Comentarios);
app.use("/api", Contactorouter);

// Evita que los errores internos o de CORS expongan trazas al cliente.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.message === "Origen no permitido por CORS") {
    return res.status(403).json({ error: "Origen no autorizado" });
  }
  console.error("Error no controlado:", error.message);
  return res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});
