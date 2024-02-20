import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDB = async () => {
    try {
        const connectionInstance =  await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
         console.log(`MONGODB CONNECTED !!!! ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log(`MONGOOSE CONNECTION FAILED !!! ,${error}`);
        process.exit(1);
    }
}

 export  default  connectDB ;