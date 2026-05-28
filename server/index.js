
// Force IPv4 DNS — Windows resolves some subdomains only via IPv6 which Node can't connect to
require('dns').setDefaultResultOrder('ipv4first')

// App bootstrap: load + validate config, wire middleware, mount routers, listen.
const config = require('./config')
const express = require('express')
const cors = require('cors')
const path = require('path')

const requireAuth = require('./middleware/auth')
const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')
const wardrobeRouter = require('./routes/wardrobe')
const wishlistRouter = require('./routes/wishlist')
const tryonRouter = require('./routes/tryon')
const recommendationsRouter = require('./routes/recommendations')
const looksRouter = require('./routes/looks')

const app = express()

app.use(cors());
app.use(express.json());

app.use('/api', authRouter)                            // register / login — no auth needed
app.use('/api/profile', requireAuth, profileRouter)
app.use('/api/wardrobe', requireAuth, wardrobeRouter)
app.use('/api/wishlist', requireAuth, wishlistRouter)
app.use('/api/tryon', requireAuth, tryonRouter)
app.use('/api/looks', requireAuth, looksRouter)
app.use('/api', requireAuth, recommendationsRouter)    // /api/catalog + /api/recommendations

// Serve built React frontend in production
const DIST = path.join(__dirname, '..', 'app', 'dist')
app.use(express.static(DIST))
app.get('/{*splat}', (req, res) => res.sendFile(path.join(DIST, 'index.html')))

app.listen(config.PORT, () => console.log(`Closet API running on http://localhost:${config.PORT}`))
