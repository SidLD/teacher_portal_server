import { type Context } from 'hono'
import { User } from '../models/index.js'
import CONFIG from '../config/vars'
import type { IUser, IUserDoc } from '../models/userModel.js'
import jwt from 'jsonwebtoken' 
import { generateCode } from '../utils/codeGenerator.js'
import { uploadFile } from '../service/bucket.js'
import { IFile } from '../models/fileMode.js'

export const getUsers = async (c: Context) => {
  try {
    const { start = 0, limit = 10, search = "", sort = "createdAt" }: any = c.req.query();
    const startNumber = parseInt(start as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const searchCriteria = search
      ? { username: search, role : 'USER'} 
      : { role : 'USER' };
    const sortCriteria: Record<string, 1 | -1> = {};
    if (typeof sort === "string") {
      const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
      const sortOrder = sort.startsWith("-") ? -1 : 1;
      sortCriteria[sortField] = sortOrder;
    };
    const users = await User.find(searchCriteria)
      .sort(sortCriteria)
      .skip(startNumber)
      .limit(limitNumber)
      .select('-password')
      .populate('file');
      
    const totalUsers = await User.countDocuments(searchCriteria);

    return c.json({ users, total: totalUsers, start: startNumber, limit: limitNumber });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
};

export const register = async (c: Context) => {
  try {
    const body:FormData =  await c.req.formData()
    const rawData = Object.fromEntries(body.entries()); 
    
    const formData: Partial<IUser> = {
      ...rawData,
      role: rawData.role as "USER" | "ADMIN" ?? "USER",
      file: body.get('file') as any
    };

    if (!formData.email) {
      c.status(400)
      throw new Error('Email is required')
    }

    const user: IUserDoc | null = await User.findOne({
      $or: [
        { email: formData.email },
        { username: formData.username }, 
        { contact: formData.contact }
      ]
    })

    if (user) {
      c.status(400)
      throw new Error('Email, Username or Contact already in used by other User.')
    }
    console.log(formData.file)
    let fileId = null;
    if(formData.file){
        fileId = await uploadFile(formData.file as any as File, `${formData.username}-${new Date()}`)
    }

    const code = await generateCode(c);
    const newUser = await User.create({
      username: formData.username,
      email: formData.email,
      role: 'USER',
      password: formData.password ? formData.password : 'password',
      code,
      birthday: formData.birthday,
      address: formData.address,
      educational_attainment: formData.educational_attainment ,
      position: formData.position,
      contact: formData.contact,
      file: fileId? fileId._id : null,
    })
    const payload = {
      id: newUser._id,
      role: newUser.role,
      username: newUser.username,
    }
    const token = jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: '12h' })

    return c.json({
      success: true,
      data: {user:newUser, password:undefined},
      code,
      token,
      message: 'User created successfully',
    })
  } catch (error: any) {
    c.status(400)
    return c.json({ message: error.message })
  }
}

export const login = async (c: Context) => {
    try {
      const params: IUserDoc = await c.req.json() 
  
      const user: IUserDoc | null = await User.findOne({ username: params.username })
  
      if (user) {
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
      return c.json({ message: error.message })
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
    console.log(error.message)
    c.status(400)
    return c.json({ message: error.message })
  }
}

export const deleteUser = async (c: Context) => {
  try {
    const { userId }: any = c.req.param();
   
    const deletedUser = await User.deleteOne({_id: userId})

    return c.json(deletedUser);
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
};
