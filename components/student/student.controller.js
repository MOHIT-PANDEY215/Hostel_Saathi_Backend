import { BSON } from "bson";
import dotenv from "dotenv";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Student from "./student.model.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

dotenv.config();

const timestamp = new Date().toISOString();

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    console.log(userId);
    const user = await Student.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token" + error
    );
  }
};

const studentController = {
  registerStudent: asyncHandler(async (req, res) => {
    try {
      const { fullName, registrationNumber, password, hostelNumber, mobileNumber } = req.body;

      if (
        [fullName, registrationNumber, password, hostelNumber, mobileNumber].some(
          (field) => field?.trim() === ""
        )
      ) {
        throw new ApiError(400, "Insufficient credentials");
      }

      const existedUser = await Student.findOne({ registrationNumber });

      if (existedUser) {
        throw new ApiError(409, "User already exists");
      }

      const user = await Student.create({
        fullName,
        password,
        hostelNumber,
        mobileNumber,
        registrationNumber,
        userRole: "student",
      });

      const createdUser = await Student.findById(user._id).select("-password -refreshToken");

      if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
      }

      return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
      );
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),

  loginStudent: asyncHandler(async (req, res) => {
    try {
      const { registrationNumber, password } = req.body;

      if (!registrationNumber || !password) {
        throw new ApiError(400, "Insufficient credentials");
      }

      const student = await Student.findOne({ registrationNumber });

      if (!student) {
        throw new ApiError(404, "User does not exist");
      }

      const isPasswordValid = await student.isPasswordCorrect(password);

      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
      }

      const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(student._id);
      const loggedInUser = await Student.findById(student._id).select("-password -refreshToken");

      const options = { httpOnly: true, secure: true };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),

  logoutUser: asyncHandler(async (req, res) => {
    try {
      await Student.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });

      const options = { httpOnly: true, secure: true };

      return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),

  refreshAccessToken: asyncHandler(async (req, res) => {
    try {
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
      }

      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await Student.findById(decodedToken?._id);

      if (!user || incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Invalid or expired refresh token");
      }

      const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id);

      const options = { httpOnly: true, secure: true };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
    } catch (error) {
      const status = error.statusCode || 401;
      return res.status(status).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),

  changeCurrentPassword: asyncHandler(async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await Student.findById(req.user?._id);

      if (!user || !(await user.isPasswordCorrect(oldPassword))) {
        throw new ApiError(400, "Invalid old password");
      }

      user.password = newPassword;
      await user.save({ validateBeforeSave: false });

      return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),

  getCurrentUser: asyncHandler(async (req, res) => {
    try {
      return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
    } catch (error) {
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

