import {  Schema, model } from 'mongoose'

export interface IFile {
    _id?: String,
    type: String,
    generation: String
    metageneration: String
    fullPath: String
    name: String
    size: Number
    timeCreated: String
    downloadURL: String
}

const fileSchema = new Schema<IFile>(
  {
    type:  { type: String, required: true },
    generation:  { type: String, required: true },
    metageneration:  { type: String, required: true },
    fullPath:  { type: String, required: true },
    name:  { type: String, required: true },
    size:  { type: Number, required: true },
    timeCreated: { type: String, required: true },
    downloadURL: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const File = model('File', fileSchema)
export default File