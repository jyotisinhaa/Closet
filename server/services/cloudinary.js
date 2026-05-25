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

// Downloads any image URL and re-uploads to Cloudinary.
// Used to guarantee Perfect Corp can fetch the image — avoids issues with
// original upload encoding or folder-level access on Cloudinary.
const axios = require('axios')
async function ensureCloudinaryUrl(imageUrl, folder = 'closet/tryon-cache') {
  if (!imageUrl) return imageUrl
  const res = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    headers: { 'User-Agent': 'Mozilla/5.0' },
    maxRedirects: 5,
  })
  const buffer = Buffer.from(res.data)
  const result = await uploadToCloudinary(buffer, { folder, resource_type: 'image' })
  return result.secure_url
}

module.exports = { cloudinary, uploadToCloudinary, destroyFromCloudinary, ensureCloudinaryUrl }
