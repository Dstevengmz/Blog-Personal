const multer = require("multer");

// Use memory storage so we can stream buffers to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) cb(null, true);
  else cb(new Error('Solo se permiten imágenes'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
