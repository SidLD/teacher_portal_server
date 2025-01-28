import { Hono } from 'hono'
import { protect, isAdmin } from '../middlewares/authMiddlewares.js'
import { 
  getUsers, 
  register, 
  login, 
  registerAdmin
} from '../controllers/userController.js'
import { z } from 'zod'
import { validator } from 'hono/validator'
import CONFIG from '../config/vars.js'

const users = new Hono()
// User Route
users.post('/register', validator('json', (value, c) => {
    const body = value['json']
    if (!body || typeof body !== 'string') {
      return c.text('Invalid!', 400)
    }
    return {
      body: body,
    }
  }),register)
users.get('/login', login)
users.get('/', protect, isAdmin, getUsers)
users.post('/register-admin',
    validator('header', (value, c) => {
        const header = value['authorization']
        if(header != CONFIG.ADMIN_AUTH){ 
            c.status(403)
            throw Error('You are not Authorized to do this sheet')
        }
        }),
    validator('json', (value, c) => {
        const result = z.object({
            username: z.string().min(3, 'Username must be at least 3 characters long'),
            email: z.string().email('Invalid email address'),
            password: z.string().min(6, 'Password must be at least 6 characters long'),
            role: z.enum(['ADMIN', 'USER'])
        }).safeParse(value)
        if (!result.success) {
            c.status(400)
            return c.json({ message: result.error.errors[0].message })
        }
    return result.data
}), registerAdmin)
users.post('/populate-seeder', protect, isAdmin, getUsers)
export default users