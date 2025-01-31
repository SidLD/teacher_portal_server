import { Context } from "hono"
import Position, { IPosition } from "../models/positionModel"
import { User } from "../models"


export const getPositions = async (c: Context) => {
    const positions = await Position.find().sort({name: 1})
    return c.json({ positions })
}

export const createPosition = async (c: Context) => {
    try {
        const { name, type }: IPosition = await c.req.json()
 
        const positionExist = await Position.findOne({name})
        if(positionExist){
            c.status(400)
            throw new Error('Position Exist')
        }  
        const newPosition = await Position.create({
            name, type
        })
        return c.json(newPosition)

    } catch (err:any) {
        c.status(400)
        return c.json({ message: err.message })
    } 
}

export const updatePosition = async (c: Context) => {
   try {
        const { positionId } = c.req.param()
        const {name, type}:IPosition  = await c.req.json()
        const position = await Position.findByIdAndUpdate(positionId, {
            name, type
        })
        return c.json({ position })
    } catch (err:any) {
        console.log(err)
        c.status(400)
        return c.json({ message: err.message })
    } 
}

export const deletePosition = async (c: Context) => {
   try {
        const { positionId } = c.req.param()
        const userConnected = await User.find({position: positionId}).count()
        if(userConnected > 0){
            c.status(400)
            throw new Error("Some User is connected to this Position")
        }
        const deletedPosition = await Position.findByIdAndDelete(positionId)
        c.status(200)
        return c.json({
            data: deletedPosition
        })
   } catch (err:any) {
        c.status(400)
        return c.json({ message: err.message })
   } 
}