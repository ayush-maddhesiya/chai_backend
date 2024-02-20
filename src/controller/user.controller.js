import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudniary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiRespond.js";


const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken  = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ValidateBeforeSave: false})

        return { accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,"Somethings went wrong while generating referesh and access token")   
    }
}


const registerUser = asyncHandler(async (req, res) => {
    //get user details from fronted
    //validation - not empty
    //user exist - email && username
    //check for images
    //upload them to cloudinary
    //cheack if successfull uploaded or not
    //create user object - create entry in db
    //remove password and referest token fief from response
    //check for user creation 
    // return res

    const { username, email, password, fullName } = res.body;
    //console.log("email: " ,email);
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are required")
    }
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "Already exists with same email or username")
    }
    const avatarLocalPath = req.field?.avatar[0]?.path;
    //const coverImageLocalPath = req.field?.coverimages[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is requied ")
    }

    const avatar = await uploadOnCloudniary(avatarLocalPath)
    const coverImage = await uploadOnCloudniary(coverImagePath)

    if (!avatar) {
        throw new ApiError(400, "avatar file is requied ")
    }

    User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        }
    )

    const createUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createUser) {
        throw new ApiError(500, "Something went wrong while registion the user")
    }


    return res.status(201).json(
        new ApiResponse(200, createUser, "user registered Successfully")
    )
})


const loginUser = asyncHandler(async (req, res) => {
    //reb.body -> body
    //username || email
    //find the user
    //cheak passwork
    //send cookie
    if (!username || !email) {
        throw new ApiError(400, "Username or email is requied");
    }
    const user = User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "NOt found user")
    }
    const isPasswordVaild = await user.isPasswordCorrect(password)

    if (!isPasswordVaild) {
        throw new ApiError(401, "not valid passwword")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options   = {
        httpOnly : true,
        secure: true
    }    

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,
                refreshToken
            },
            "Uesr logged in sucessfully ."
        )
    )


})


const loggedOutUser = asyncHandler(async (req,res)=>{
    //req body -> data
    //username or email
    //password check
    //access and refersh token
    //send cookie

    const { email, username, password} = req.body

    if(!( username ||  email)){
        throw new ApiError(400,"username or email is required")
    }
})

const logOutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"USer logged Out "))
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

export { registerUser,loginUser ,logOutUser,getUserChannelProfile}