const express = require('express')
const pool    = require('../db/client')
const { hashPassword, generateToken } = require('../lib/auth')

const router = express.Router()

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const salt         = require('crypto').randomBytes(16).toString('hex')
  const passwordHash = hashPassword(password, salt)
  const token        = generateToken()

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, name, password_hash, salt, token)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, token`,
      [email, name || '', passwordHash, salt, token]
    )
    const user = rows[0]
    res.json({ token: user.token, user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' })
    console.error('Register error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  const user = rows[0]
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  const hash = hashPassword(password, user.salt)
  if (hash !== user.password_hash) return res.status(401).json({ error: 'Invalid email or password' })

  const token = generateToken()
  await pool.query('UPDATE users SET token = $1 WHERE id = $2', [token, user.id])

  res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const { rows } = await pool.query('SELECT id, email, name FROM users WHERE token = $1', [token])
  if (!rows[0]) return res.status(401).json({ error: 'Invalid token' })

  res.json(rows[0])
})

module.exports = router
