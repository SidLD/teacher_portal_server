
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors'
import { Hono } from 'hono'
import connectDB from './config/db.js'
import { errorHandler, notFound } from './middlewares/errorMiddleware.js'
import CONFIG from './config/vars.js'
import chalk from 'chalk'
import { serve } from '@hono/node-server'
import users from './router/userRouter.js'
import position from './router/positionRouter.js'

// Initialize the Hono app
const app = new Hono().basePath('/api/')
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

// ****************   START OF API     ****************

app.get('/', (c) => c.text('Welcome to the API!'))
app.route('/users', users)
app.route('/positions', position)

// ****************   END OF API     ****************


app.onError((_err, c) => {
  const error = errorHandler(c)
  return error
})

app.notFound((c) => {
  const error = notFound(c)
  return error
})
// ****************   START OF DB CONNECTION     ****************
connectDB()

try {
  const port = CONFIG.PORT as number;
  serve({
    port,
    fetch: app.fetch,
  })
  console.log(chalk.green(`Ready on http://localhost:${port}/api/`));
} catch (err:any) {
  console.log(chalk.red(err));
} 

// ****************   END OF DB CONNECTION     ****************
