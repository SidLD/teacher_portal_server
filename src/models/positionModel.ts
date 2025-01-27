
import {  Schema, model } from 'mongoose'

export interface IPosition {
    _id?: string
    type: 'TEACHING' | 'NON_TEACHING'
    name: string
}

const positionSchema = new Schema<IPosition>(
    {
      type: { type: String, required: true, default: 'TEACHING' },
      name: { type: String, required: true, },
    },
    {
      timestamps: true,
    }
)


const Position = model('Position', positionSchema)
export default Position