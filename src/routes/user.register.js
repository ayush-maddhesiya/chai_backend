import { Router } from "express";
import { registerUser } from "../controller/user.controller";
import {upload} from "../middlewares/multer.middleware.js"
import { verify } from "jsonwebtoken";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();




router.route("/register").post(
    upload.fields([
        {
            name:"avtar",
            maxCount : 1
        },{
            name:"coverimages",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)


//secured routes..
router.route("/logout").post(verifyJWT,logoutUser)



export default router