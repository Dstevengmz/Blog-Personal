# API de BlogDarwin

Backend del portafolio BlogDarwin. Expone recursos de proyectos, artículos, comentarios, usuarios, autenticación y contacto mediante una API REST construida con Node.js, Express, Sequelize y MySQL.

## Tecnologías

- Node.js y Express 5.
- Sequelize 6 con MySQL.
- JWT para sesiones y bcrypt para contraseñas.
- Resend para correos transaccionales mediante HTTPS.
- Cloudinary y Multer para imágenes.
- `express-rate-limit` para limitar solicitudes sensibles.

## Estructura

```text
backend/
├── app.js                 # Configuración HTTP, CORS, cabeceras y rutas
├── config/                # Configuración de Sequelize por entorno
├── controllers/           # Validación de entrada y respuestas HTTP
├── lib/                   # Utilidades puras para tokens y contraseñas
├── middlewares/           # Autenticación, autorización y archivos
├── migrations/            # Cambios versionados de la base de datos
├── models/                # Modelos y asociaciones de Sequelize
├── routers/               # Definición de endpoints
├── services/              # Reglas de negocio e integraciones externas
└── test/                  # Pruebas automatizadas
```

## Configuración

El archivo `.env.example` contiene únicamente los nombres y ejemplos no secretos. El archivo `.env` es local y está excluido de Git.

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto del servidor. Render lo proporciona automáticamente. |
| `NODE_ENV` | Entorno de ejecución, normalmente `production` en Render. |
| `JWT_SECRET` | Secreto privado y extenso para firmar los tokens de sesión. |
| `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_DIALECT` | Conexión privada con MySQL. |
| `RESEND_API_KEY` | Clave privada de Resend. Solo se configura en el proveedor. |
| `RESEND_FROM` | Remitente autorizado por Resend. |
| `CONTACT_EMAIL` | Destinatario del formulario de contacto. |
| `FRONTEND_URL` | URL usada para crear enlaces de recuperación. |
| `CORS_ORIGINS` | Orígenes web autorizados, separados por comas. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credenciales privadas de Cloudinary. |

Ninguna clave privada debe utilizar el prefijo `VITE_`, porque Vite incorpora esas variables al JavaScript público del navegador.

## Instalación y ejecución

```bash
npm ci
npm run migrate
npm start
```

Durante el desarrollo:

```bash
npm run dev
```

## Endpoints principales

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `POST /api/auth/registrar` | Público y limitado | Crea únicamente cuentas con rol `visitante`. |
| `POST /api/auth/iniciarsesion` | Público y limitado | Valida credenciales y entrega un JWT de dos horas. |
| `POST /api/auth/recuperar-contrasena` | Público y limitado | Envía un enlace si el correo está registrado. |
| `POST /api/auth/restablecer-contrasena` | Público y limitado | Consume un token válido y actualiza la contraseña. |
| `POST /api/contacto` | Público y limitado | Envía un mensaje mediante Resend. |
| `GET /api/listarproyectos` | Público | Lista proyectos y acepta `tipo` y `limit`. |
| `GET /api/listararticulos` | Público | Lista artículos y acepta `limit`. |
| `/api/*usuario*` | Solo administrador | Administra cuentas sin devolver contraseñas ni tokens internos. |

Las rutas de creación, edición, eliminación y carga de imágenes de proyectos y artículos están protegidas mediante JWT y autorización por rol o propiedad.

## Recuperación de contraseña

1. El correo se normaliza y valida.
2. Se genera un token criptográfico aleatorio de 32 bytes.
3. La base de datos guarda únicamente el hash SHA-256 del token y su vencimiento.
4. Resend envía el token original dentro de un enlace construido con `FRONTEND_URL`.
5. El enlace vence en 30 minutos y la actualización atómica impide reutilizarlo.
6. La contraseña nueva se almacena con bcrypt y los campos de recuperación quedan anulados.

La respuesta de solicitud es deliberadamente genérica para no revelar si una dirección está registrada.

## Controles de seguridad

- Los archivos `.env`, cargas locales, logs y dependencias están ignorados por Git.
- Las contraseñas, hashes y tokens de recuperación se excluyen por defecto de las consultas del modelo `Usuario`.
- Las respuestas de registro e inicio de sesión incluyen únicamente `id`, `nombre`, `email` y `rol`.
- El registro público fuerza el rol `visitante`.
- La administración de usuarios exige un JWT con rol `admin`.
- Las contraseñas también se cifran al ser modificadas desde la administración.
- Login, registro, recuperación y contacto tienen límites independientes por dirección IP.
- CORS acepta el sitio publicado, los orígenes configurados y localhost únicamente fuera de producción.
- Las cabeceras HTTP reducen exposición de tecnología, carga en marcos y detección incorrecta de contenido.
- Los errores internos se registran en el servidor sin devolver trazas al cliente.

El remitente de prueba `onboarding@resend.dev` solo envía al correo propietario de la cuenta de Resend. El envío a otros usuarios requiere un dominio verificado y un `RESEND_FROM` perteneciente a ese dominio.

## Pruebas y mantenimiento

```bash
npm test
npm audit --omit=dev
```

La auditoría puede reportar alertas transitivas que no tengan una actualización compatible disponible. Antes de aplicar `npm audit fix --force` debe revisarse el cambio propuesto, porque puede instalar versiones incompatibles.

## Despliegue en Render

Configuración del Web Service:

```text
Build Command: npm ci && npm run migrate
Start Command: npm start
```

Las variables privadas se configuran en **Environment**. Con **Auto-Deploy: On Commit**, cada cambio enviado a la rama configurada inicia un despliegue y aplica únicamente las migraciones pendientes.
