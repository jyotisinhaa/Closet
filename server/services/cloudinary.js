// Cloudinary image storage. cloudinary is configured in config.js.
const { Readable } = require('stream')
const { cloudinary } = require('../config')

// Upload a buffer and resolve with the full Cloudinary result.
function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
    Readable.from(buffer).pipe(stream)
  })
}

function destroyFromCloudinary(publicId, options = { invalidate: true }) {
  return cloudinary.uploader.destroy(publicId, options)
}

module.exports = { cloudinary, uploadToCloudinary, destroyFromCloudinary }
