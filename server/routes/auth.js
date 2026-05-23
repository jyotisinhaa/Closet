const express = require('express')
const crypto = require('crypto')
const { readData, writeData } = require('../lib/db')
const { hashPassword, generateToken } = require('../lib/auth')

const router = express.Router()

router.post('/register', (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const data = readData()
  if (data.users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  const salt = crypto.randomBytes(16).toString('hex')
  const passwordHash = hashPassword(password, salt)
  const token = generateToken()

  const user = {
    id: crypto.randomUUID(),
    email,
    name: name || '',
    passwordHash,
    salt,
    token,
    createdAt: new Date().toISOString(),
  }

  data.users.push(user)
  writeData(data)

  res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const data = readData()
  const user = data.users.find(u => u.email === email)
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  const hash = hashPassword(password, user.salt)
  if (hash !== user.passwordHash) return res.status(401).json({ error: 'Invalid email or password' })

  user.token = generateToken()
  writeData(data)

  res.json({ token: user.token, user: { id: user.id, email: user.email, name: user.name } })
})

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const data = readData()
  const user = data.users.find(u => u.token === token)
  if (!user) return res.status(401).json({ error: 'Invalid token' })

  res.json({ id: user.id, email: user.email, name: user.name })
})

module.exports = router
