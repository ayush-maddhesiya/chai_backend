//require('dotenv').config({path : "./env"})
import dotenv from "dotenv";
import Express from "express";
import connectDB from "./db/index.js"
dotenv.config({
    path: './.env'
});

const app = Express();

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at ${process.env.PORT || 8000}`);
    })
})
.catch((err)=>{
    console.log("MONGO DB connection failed : ",err);
})
.finally(()=>{
    console.log("dont know what is happing");
})