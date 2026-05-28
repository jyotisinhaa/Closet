const pool = require('../db/client')

module.exports = async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE token = $1', [token])
    if (!rows[0]) return res.status(401).json({ error: 'Invalid or expired token' })
    req.userId = rows[0].id
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
