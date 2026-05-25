// Centralized configuration. Loads .env from the server directory (where
// .gitignore expects it), falling back to the repo root, so it works no matter
// which directory the process is started from. Validates required keys and
// configures Cloudinary.
const fs = require('fs')
const path = require('path')

const LOCAL_ENV = path.join(__dirname, '.env')
const ROOT_ENV = path.join(__dirname, '..', '.env')
const ENV_PATH = fs.existsSync(LOCAL_ENV) ? LOCAL_ENV : ROOT_ENV
require('dotenv').config({ path: ENV_PATH })

const { v2: cloudinary } = require('cloudinary')

const REQUIRED = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'PERFECT_CORP_API_KEY',
  'GROQ_API_KEY',
  'JINA_API_KEY',
  'DATABASE_URL',
]

const missing = REQUIRED.filter((k) => !process.env[k])
if (missing.length) {
  console.error(
    `Missing required env vars: ${missing.join(', ')}.\n` +
    `Add them to ${ENV_PATH} and restart.`
  )
  process.exit(1)
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

module.exports = {
  cloudinary,
  PORT: process.env.PORT || 3001,
  PERFECT_CORP_API_KEY: process.env.PERFECT_CORP_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  // Crusoe Managed Inference (NVIDIA Nemotron). Optional: when CRUSOE_API_KEY is
  // set, the stylist reasoning runs on Nemotron and falls back to Groq on error.
  CRUSOE_API_KEY: process.env.CRUSOE_API_KEY,
  CRUSOE_BASE_URL: process.env.CRUSOE_BASE_URL || 'https://api.inference.crusoecloud.com/v1',
  CRUSOE_MODEL: process.env.CRUSOE_MODEL || 'nvidia/Nemotron-3-Nano-Omni-Reasoning-30B-A3B',
}
