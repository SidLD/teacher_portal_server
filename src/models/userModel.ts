import {  Schema, model } from 'mongoose'
import bcrypt from 'bcrypt';
import CONFIG from '../config/vars';

interface IUser {
  matchPassword(arg0: string): unknown;
  status: string;
  _id?: string
  username: string
  code: string
  birthday: Date
  address: string
  email: string
  contact:string
  educational_attainment: string
  position: string
  role: 'ADMIN'| 'USER'
  password?: string
}

export interface IUserDoc extends IUser, Document {
  matchPassword: (pass: string) => Promise<boolean>
}

const userSchema = new Schema<IUserDoc>(
  {
    username:               { type: String, required: true },
    email:                  { type: String, required: true, unique: true },
    password:               { type: String, required: false },
    code:                   { type: String, required: true, unique: true },
    birthday:               {type: Date, required: true},
    address:                { type: String, required: true },
    educational_attainment: { type: String, required: true },
    position:               { type: String, required: true, ref: 'Position' },
    role:                   { type: String, required: true, default: 'USER' },
    contact:                { type: String, required: true, unique: true },
    
  },
  {
    timestamps: true,
  }
)

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return bcrypt.compareSync(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  this.password = await bcrypt.hash(this.password as string, CONFIG.JWT_SECRET )
})

const User = model('User', userSchema)
export default User