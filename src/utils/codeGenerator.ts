import { Context } from "hono";
import { User } from "../models";
import { IUserDoc } from "../models/userModel";
import CONFIG from "../config/vars";

export const generateCode = async (c: Context) : Promise<String> => {
    let Code = "";
    try {
        Code += new Date().getFullYear();
        const latestUser:IUserDoc | null = await User.findOne().sort({ code: -1 });
        if(latestUser){
            const latestCode = latestUser.code.substring(4);
            let newCode =  (String)(parseInt(latestCode) + 1);
            const newCodeSize = newCode.length;
            for (let index = 0; index < CONFIG.ID_SIZE - newCodeSize; index++) {
               newCode = `0${newCode}`
            }
            Code = `${Code}${newCode}`
        }else{
            let tempCode = ''
            for (let index = 0; index < CONFIG.ID_SIZE; index++) {
                tempCode +=`0`
            }
            Code = `${Code}${tempCode}`
        }
    } catch (err) {
        c.status(500)
        throw new Error('Something went wrong, please contact the cool guy developer')
    } 
    return Code;
}