import { Hono } from 'hono'
import { user } from '../controllers/index.js'
import { isAdmin, protect } from '../middlewares/index.js'

const users = new Hono()

// Get All Users
users.get('/', protect, isAdmin, (c) => user.getUsers(c))

// Create User
users.post('/', (c) => user.register(c))

// Login User
users.post('/login', (c) => user.login(c))

// Get Single User
users.get('/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ message: `User ${id}` })
})

// Get User Profile
users.get('/profile', (c) => {
  return c.json({ message: 'User Profile' })
})

export default users