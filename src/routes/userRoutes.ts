import { Hono } from 'hono'
import { protect, isAdmin } from '../middlewares/authMiddlewares.js'
import { 
  getUsers, 
  register, 
  login 
} from '../controllers/userController.js'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const users = new Hono()

users.post('/', 
  zValidator('json', z.object({
    username: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['USER', 'ADMIN']).optional()
  })),
  (c) => register(c)
)

users.post('/login', 
  zValidator('json', z.object({
    email: z.string().email(),
    password: z.string()
  })),
  (c) => login(c)
)

users.get('/', protect, isAdmin, (c) => getUsers(c))

export default users