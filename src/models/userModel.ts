import {  Schema, model } from 'mongoose'
import bcrypt from 'bcrypt';
import { IFile } from './fileMode';

export interface IUser {
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
  file?: IFile
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
    birthday:               { type: Date  },
    address:                { type: String},
    educational_attainment: { type: String},
    position:               { type: String, ref: 'Position' },
    role:                   { type: String, default: 'USER' },
    contact:                { type: String, unique: true },
    file:                   { type: String, ref: 'File' },
    
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
  this.password = await bcrypt.hash(this.password as string, 10 )
})

const User = model('User', userSchema)
export default User