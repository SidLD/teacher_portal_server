// import * as mongoose from 'mongoose'

import mongoose from "mongoose"
import CONFIG from "./vars"
import chalk from "chalk";

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    mongoose.connect(`${CONFIG.ATLAS_URI}`);
    console.log(chalk.greenBright('Connected to Database.'));
  } catch (err: any) {
    console.error(chalk.red(`Error: ${err.message}`))
    process.exit(1)
  }
}

export default connectDB