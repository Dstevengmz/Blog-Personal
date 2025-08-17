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

app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: "*",
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

app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});
