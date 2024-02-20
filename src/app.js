import  express  from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app = Express();

app.use(cors({
    origin :  process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlenconded({extended: true,limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//router import
import userRouter from "./routes/user.register.js";


//route declartion
app.use("/api/v1/users",userRouter)


export { app }