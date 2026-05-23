
// App bootstrap: load + validate config, wire middleware, mount routers, listen.
const config = require('./config')
const express = require('express')
const cors = require('cors')

const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')
const wardrobeRouter = require('./routes/wardrobe')
const wishlistRouter = require('./routes/wishlist')
const tryonRouter = require('./routes/tryon')

const app = express()

app.use(cors());
app.use(express.json());


app.use('/api', authRouter)          // /api/register, /api/login, /api/me
app.use('/api/profile', profileRouter)
app.use('/api/wardrobe', wardrobeRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/tryon', tryonRouter)

app.listen(config.PORT, () => console.log(`Closet API running on http://localhost:${config.PORT}`))
