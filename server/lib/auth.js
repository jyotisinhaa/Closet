const crypto = require('crypto')

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

module.exports = { hashPassword, generateToken }
