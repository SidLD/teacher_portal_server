import { Hono } from 'hono'
import { protect, isAdmin } from '../middlewares/authMiddlewares.js'
import { createPosition, deletePosition, getPositions, updatePosition } from '../controllers/positionControllet.js'
import { validator } from 'hono/validator'

import z from 'zod';

const position = new Hono()
position.get('/', getPositions)
position.post('/', protect, isAdmin, validator('json', (value, c) => {
    const result = z.object({
        type: z.enum(['TEACHING', 'NON_TEACHING']),
        name: z.string().min(3, 'Name must atleat have 3 length')
    }).safeParse(value)
    if (!result.success) {
        c.status(400)
        return c.json({ message: result.error.errors[0].message })
    }
    
    return result.data
}), createPosition)
position.put('/', protect, isAdmin, validator('json', (value, c) => {
    const result = z.object({
        type: z.enum(['TEACHING', 'NON_TEACHING']),
        name: z.string().min(3, 'Name must atleat have 3 length')
    }).safeParse(value)
    if (!result.success) {
        c.status(400)
        return c.json({ message: result.error.errors[0].message })
    }
    
    return result.data
}), updatePosition)

position.delete('/', deletePosition)
export default position