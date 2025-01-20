import { type Context } from 'hono'
import { genToken } from '../utils/index.js'
import { User } from '../models/index.js'
import { type IUser } from '../models/userModel.js'

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
        const body:IUser = await c.req.json()

        if (!body.email) {
            c.status(400)
            throw new Error('User already exists')
        }
      
        const user:IUser | null = await User.findOne({email: body.email})

      if(user){
        c.status(400)
        throw new Error('User already exists')
      }
      const password = body.password ? body.password.toString() : 'password';
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = await User.create({
        username: body.username,
        email: params.email,
        firstName: params.firstName,
        middleName: params.middleName,
        lastName: params.lastName,
        role: params.role,
        password: hashedPassword,
        profile: body?.profile ? profile : null,
        status: 'PENDING'
      })

      const token = await genToken(newUser._id.toString())

      return c.json({
        success: true,
        data: newUser,
        token,
        message: 'User created successfully',
      })

    } catch (error: any) {
        c.status(400)
        throw new Error('Something went Wrong')
    }
}
/**
 * @api {post} /users/login Login User
 * @apiGroup Users
 * @access Public
 */
export const login = async (c: Context) => {
    try {
        const params:any = req.body
        const user:IUser | null = await userSchema.findOne({ email: params.email })
        if(user){
            if(user.status != 'APPROVED'){
              return res.status(400).send({ok:false, message:"Account need Admin Approval" })
            }
            const isMatch = await bcrypt.compare(params.password, user.password.toString())
            if(isMatch){
                const payload = {
                    id: user._id,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    middleName: user.middleName
                };
                jwt.sign(
                    payload,
                    `${process.env.JWT_SECRET}`,
                    { expiresIn: "12hr" },
                    async (err, token) => {
                        if(err){
                            res.status(400).send({message: err.message})
                        }else{
                            res.status(200).send({token: token})
                        }
                    }
                )  
            }else{
                res.status(400).send({ok:false, message:"Incorrect Email or Password" })
            }
        }else{
            res.status(400).send({message:"Incorrect Email or Password" })
        }
    } catch (error: any) {
        console.log(error.message)
        res.status(400).send({message:"Invalid Data or Email Already Taken"})
    }
  }
