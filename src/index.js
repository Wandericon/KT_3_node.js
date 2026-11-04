import express from 'express'
import { port } from './config/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import usersRouter from './routes/users.js'
import postsRouter from './routes/posts.js'

const app = express()

app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/posts', postsRouter)

app.use((req, res) => res.status(404).json({ error: 'Маршрут не найден' }))
app.use(errorHandler)

app.listen(port, () => console.log(`Сервер запущен: http://localhost:${port}`))
