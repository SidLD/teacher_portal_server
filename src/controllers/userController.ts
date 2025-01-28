import { type Context } from 'hono'
import { User } from '../models/index.js'
import CONFIG from '../config/vars'
import type { IUserDoc } from '../models/userModel.js'
import jwt from 'jsonwebtoken' 
import { validator } from 'hono/validator'
import { generateCode } from '../utils/codeGenerator.js'


/**
 * @api {get} /users Get All Users
 * @apiGroup Users
 * @access Private
 */
export const getUsers = async (c: Context) => {
  const users = await User.find()
  return c.json({ users })
}

/**
 * @api {post} /users Create User
 * @apiGroup Users
 * @access Public
 */
export const register = async (c: Context) => {
  try {
    const body: IUserDoc = await c.req.json()

    if (!body.email) {
      c.status(400)
      throw new Error('Email is required')
    }

    const user: IUserDoc | null = await User.findOne({ email: body.email })

    if (user) {
      c.status(400)
      throw new Error('User already exists')
    }
    const code = await generateCode(c);
    const newUser = await User.create({
      username: body.username,
      email: body.email,
      role: 'USER',
      password: body.password,
      code,
      birthday: body.birthday,
      address: body.address,
      educational_attainment: body.educational_attainment ,
      position: body.position,
      contact: body.contact,
    })
    const payload = {
        id: newUser._id,
        role: newUser.role,
        username: newUser.username,
      }
    const token = jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: '12h' })

    return c.json({
      success: true,
      data: newUser,
      token,
      message: 'User created successfully',
    })
  } catch (error: any) {
    c.status(400)
    return c.json({ message: 'Something went wrong' })
  }
}

/**
 * @api {post} /users/login Login User
 * @apiGroup Users
 * @access Public
 */
export const login = async (c: Context) => {
    try {
      const params: IUserDoc = await c.req.json() // Get user data from the request
  
      // Find the user by email
      const user: IUserDoc | null = await User.findOne({ email: params.email })
  
      if (user) {

        // Use the matchPassword method to compare the entered password with the stored hash
        const isMatch = await user.matchPassword(params.password as string)
  
        if (isMatch) {
          const payload = {
            id: user._id,
            role: user.role,
            username: user.username,
          }
  
          const token = jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: '12h' })

  
          return c.json({
            success: true,
            token,
            message: 'Login successful',
          })
        } else {
            c.status(400)
            throw new Error('Incorrect Email or Password')
        }
      } else {
            c.status(400)
            throw new Error('Incorrect Email or Password')
      }
    } catch (error: any) {
      console.log(error.message)
      c.status(400)
      throw new Error('Invalid Data or Email Already Taken')
    }
}

export const registerAdmin = async (c: Context) => {
  try {
    const body: IUserDoc = await c.req.json()
    const user: IUserDoc | null = await User.findOne({ 
      $or : [
        {email: body.email},
        {username: body.username}
      ]
     })

    if (user) {
      c.status(400)
      throw new Error('User already exists')
    }
    const code = await generateCode(c);
    const newUser = await User.create({
      username: body.username,
      email: body.email,
      role: body.role,
      password: body.password,
      code,
      birthday: null,
      address: null,
      educational_attainment: null,
      position: null,
      contact: null,
    })
    const payload = {
        id: newUser._id,
        role: newUser.role,
        username: newUser.username,
      }
    const token = jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: '12h' })

    return c.json({
      success: true,
      data: newUser,
      token,
      message: 'User created successfully',
    })
  } catch (error: any) {
    console.log(error)
    c.status(400)
    return c.json({ message: 'Something went wrong' })
  }
}