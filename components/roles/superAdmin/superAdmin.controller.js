
import dotenv from "dotenv";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import superAdminService from "./superAdmin.service.js";

dotenv.config();

const timestamp = new Date().toISOString();



const superAdminController = {
    getDashboard: asyncHandler(async (req, res) => {
        try {
            const user = req.user;
            if(!user?._id){
                throw new ApiError(401, "Unauthorized");
            }
            const data = await superAdminService.getDashboard({...req.query,user});
            
            
            return res
                .status(200)
                .json(new ApiResponse(200, { data }, "Fetched successfully"));

        } catch (error) {
            console.log(error)
            const status = error.statusCode || 500;
            return res.status(status).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString(),
            });
        }
    }),

};

export default superAdminController;