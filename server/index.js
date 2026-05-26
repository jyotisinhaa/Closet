
// Force IPv4 DNS — Windows resolves some subdomains only via IPv6 which Node can't connect to
require('dns').setDefaultResultOrder('ipv4first')

// App bootstrap: load + validate config, wire middleware, mount routers, listen.
const config = require('./config')
const express = require('express')
const cors = require('cors')

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


app.use('/api', authRouter)          // /api/register, /api/login, /api/me
app.use('/api/profile', profileRouter)
app.use('/api/wardrobe', wardrobeRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/tryon', tryonRouter)
app.use('/api/looks', looksRouter)
app.use('/api', recommendationsRouter)

app.listen(config.PORT, () => console.log(`Closet API running on http://localhost:${config.PORT}`))
