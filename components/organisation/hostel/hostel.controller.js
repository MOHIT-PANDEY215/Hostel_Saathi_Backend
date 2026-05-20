
import dotenv from "dotenv";
import hostelService from "./hostel.service.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

dotenv.config();

const timestamp = new Date().toISOString();



const hostelController = {
    createHostel: asyncHandler(async (req, res) => {
        try {
            const user = req.user;
            if(!user?._id){
                throw new ApiError(401, "Unauthorized");
            }
            const hostel = await hostelService.createHostel({...req.body,user});
            
            return res
                .status(201)
                .json(new ApiResponse(201, { hostel }, "Hostel created successfully"));

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
    getAllHostels: asyncHandler(async (req, res) => {
        try {
            console.log("here")
            const user = req.user;
            if(!user?._id){
                throw new ApiError(401, "Unauthorized");
            }
            const hostels = await hostelService.getAllHostels({...req.body,user});
            
            return res
                .status(201)
                .json(new ApiResponse(201, { hostels }, "Hostel fetched successfully"));

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

export default hostelController;