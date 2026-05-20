
import dotenv from "dotenv";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import bedService from "./bed.service.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

dotenv.config();

const timestamp = new Date().toISOString();



const bedController = {
    createBed: asyncHandler(async (req, res) => {
        try {
            const user = req.user;
            if(!user?._id){
                throw new ApiError(401, "Unauthorized");
            }
            const bed = await bedService.createBed({...req.body,user});
            
            return res
                .status(201)
                .json(new ApiResponse(201, { bed }, "Bed created successfully"));

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
    getAllBeds: asyncHandler(async (req, res) => {
        try {
            const user = req.user;
            if(!user?._id){
                throw new ApiError(401, "Unauthorized");
            }
            const bed = await bedService.getAllBeds({...req.query,user});
            
            return res
                .status(200)
                .json(new ApiResponse(200, { bed }, "Bed fetched successfully"));

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

export default bedController;