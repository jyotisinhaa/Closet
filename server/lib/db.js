// Simple JSON-file persistence. data.json lives in the server/ root.
const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(__dirname, '..', 'data.json')

function readData() {
  if (!fs.existsSync(DATA_FILE)) return { user: {}, wardrobe: [], wishlist: [], users: [] }
  const d = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  if (!d.users) d.users = []
  return d
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

module.exports = { readData, writeData }
