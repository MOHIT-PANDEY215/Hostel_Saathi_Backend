import Admin from "../components/admin/admin.model.js";
import Student from "../components/student/student.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
// import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        let userId;
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
            if(err){
                throw new ApiError(401, "Invalid Access Token") 
            }
            userId=user._id
        })
        let user = await Student.findById(userId).select(
            "-password -refreshToken"
          );
        if(!user){
            user = await Admin.findById(userId).select(
                "-password -refreshToken"
              );
              if(!user){

                  throw new ApiError(404, "Invalid User") 
                }
        }
        req.user = user;
        next()
        
    } catch (error) {
      return res
      .status(401)
      .json(
        {
          success:false,
          message:"Invalid access token",
          timestamp:new Date().toISOString(),
        }
        )
    }
    
})
export const verifyAdmin = asyncHandler(async(req, res, next) => {
    try {
        const user=req.user
        console.log(user)
        if(!user || user?.userRole!=='admin'){
            throw new ApiError(401,"Only admin can access.")
        }
        next()
        
    } catch (error) {
      return res
      .status(401)
      .json(
        {
          success:false,
          message:"Only admin can access.",
          timestamp:new Date().toISOString(),
        }
        )
    }
    
})