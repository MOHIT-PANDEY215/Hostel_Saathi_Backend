
import dotenv from "dotenv";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import roomService from "./room.service.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

dotenv.config();

const timestamp = new Date().toISOString();



const roomController = {
    createRoom: asyncHandler(async (req, res) => {
        try {
            const user = req.user;
            if(!user?._id){
                throw new ApiError(401, "Unauthorized");
            }
            const room = await roomService.createRoom({...req.body,user});
            
            return res
                .status(201)
                .json(new ApiResponse(201, { room }, "Room created successfully"));

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

export default roomController;