import { BSON } from "bson";
import dotenv from "dotenv";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import Student from "./student.model.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";
import studentService from "./student.service.js";

dotenv.config();

const timestamp = new Date().toISOString();

const studentController = {
  createStudent: asyncHandler(async (req, res) => {
     try {
      const userId = req.userId;
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }
      const student = await studentService.createStudent({ ...req.body, userId });

      return res
        .status(201)
        .json(new ApiResponse(201, { student }, "Student created successfully"));

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

export default studentController;

