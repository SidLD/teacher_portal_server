
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors'
import { Hono } from 'hono'
import connectDB from './config/db.js'
import users from './routes/userRoutes.js'
import { errorHandler, notFound } from './middlewares/errorMiddleware.js'
import CONFIG from './config/vars.js'
import chalk from 'chalk'
import { serve } from '@hono/node-server'

// Initialize the Hono app
const app = new Hono().basePath('/api/')

// Config MongoDB
connectDB
// Initialize middlewares
app.use('*', logger(), prettyJSON())

// Cors
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
)

// Home Route
app.get('/', (c) => c.text('Welcome to the API!'))
app.route('/users', users)

// Error Handler
app.onError((_err, c) => {
  const error = errorHandler(c)
  return error
})

// Not Found Handler
app.notFound((c) => {
  const error = notFound(c)
  return error
})

try {
  const port = CONFIG.PORT as number;
  console.log(chalk.green(`Ready on http://localhost:${port}/api/`));
  serve({
    port,
    fetch: app.fetch,
  })
} catch (err:any) {
  console.log(chalk.red(err));
} 

export type AppType = typeof app