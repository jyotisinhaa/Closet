// Shared multer instance: in-memory storage so handlers can stream buffers
// straight to Cloudinary.
const multer = require('multer')

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
})
