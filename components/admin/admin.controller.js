import { BSON } from "bson";
import dotenv from "dotenv";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import Admin from "./admin.model.js";
import { getSortBy } from "../../utils/helper.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

dotenv.config();

const timestamp = new Date().toISOString();

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    console.log(userId);
    const user = await Admin.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return res.status(500).json({
        success: false,
        message: "Something went wrong while generating referesh and access token"+error.message,
        timestamp: new Date().toISOString(),
      });
  }
};

const AdminController = {
  registerAdmin: asyncHandler(async (req, res) => {
    try {
      const { fullName, username, password, hostelNumber, mobileNumber } =
        req.body;

      if (
        [fullName, username, password, hostelNumber, mobileNumber].some(
          (field) => field?.trim() === ""
        )
      ) {
        throw new ApiError(400, "Insufficient credentials");
      }

      const existedUser = await Admin.findOne({ username });

      if (existedUser) {
        throw new ApiError(409, "User already exists");
      }

      const avatarLocalPath = req?.files[0]?.fieldname.includes("avatar")?req.files[0]?.path:undefined;
      let avatar;
      if(avatarLocalPath){
        avatar = await uploadOnCloudinary(avatarLocalPath)
      }
      
      const createParams ={
        fullName,
        password,
        hostelNumber:Number(hostelNumber),
        mobileNumber,
        username,
        userRole: "admin",
      }
      if(avatar){
        createParams.avatar=avatar?.url
      }

      const user = await Admin.create(createParams);

      const createdUser = await Admin.findById(user._id).select(
        "-password -refreshToken"
      );

      if (!createdUser) {
        throw new ApiError(
          500,
          "Something went wrong while registering the user"
        );
      }

      return res
        .status(201)
        .json(
          new ApiResponse(201, createdUser, "User registered successfully")
        );
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

  loginAdmin: asyncHandler(async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        throw new ApiError(400, "Insufficient credentials");
      }

      const isUserExists = await Admin.findOne({ username });

      if (!isUserExists) {
        throw new ApiError(404, "User does not exist");
      }

      const isPasswordValid = await isUserExists.isPasswordCorrect(password);

      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
      }

      const { accessToken, refreshToken } =
        await generateAccessAndRefereshTokens(isUserExists._id);

      const loggedInUser = await Admin.findById(isUserExists._id).select(
        "-password -refreshToken"
      );

      const options = { httpOnly: true, secure: true };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "Admin logged in successfully"
          )
        );
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

  logoutUser: asyncHandler(async (req, res) => {
    try {
      await Admin.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
      );

      const options = { httpOnly: true, secure: true };

      return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
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
      const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

      if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
      }

      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await Admin.findById(decodedToken?._id);

      if (!user || incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Invalid or expired refresh token");
      }

      const { accessToken, newRefreshToken } =
        await generateAccessAndRefereshTokens(user._id);
      const options = { httpOnly: true, secure: true };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken: newRefreshToken },
            "Access token refreshed"
          )
        );
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
      const user = await Admin.findById(req.user?._id);

      if (!user || !(await user.isPasswordCorrect(oldPassword))) {
        throw new ApiError(400, "Invalid old password");
      }

      user.password = newPassword;
      await user.save({ validateBeforeSave: false });

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
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
      return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"));
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),

  getAllAdmin: asyncHandler(async (req, res) => {
    try {
      const { pageNumber = 1, pageSize = 5, search, sort } = req.query;
      const page = parseInt(pageNumber);
      const perPage = parseInt(pageSize);
      const sortBy = getSortBy(sort);
      const skipCount = (page - 1) * perPage;
      const queryParams = {};
      const totalItems = await Admin.countDocuments(queryParams);
      const totalPages = Math.ceil(totalItems / perPage);

      let ref = await Admin.aggregate([
        { $match: queryParams },
        { $sort: sortBy },
        { $skip: skipCount },
        { $limit: perPage },
      ]);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { totalItems, totalPages, currentPage: page, ref },
            "Admins fetched successfully"
          )
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
};

export default AdminController;
