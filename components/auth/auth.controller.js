
import dotenv from "dotenv";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import authService from "./auth.service.js";

dotenv.config();

const timestamp = new Date().toISOString();



const authController = {
    signup: asyncHandler(async (req, res) => {
        try {

            let avatar;
            const avatarLocalPath = req?.files?.[0]?.fieldname.includes("avatar") ? req.files[0].path : undefined;
            if (avatarLocalPath) {
                const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath)
                avatar = uploadedAvatar?.url
            }
            console.log(req.body, "body")
            const dataToSend = { ...req.body }
            if (avatar) {
                dataToSend.avatar = avatar
            }
            const { createdUser, accessToken, refreshToken } = await authService.signup(dataToSend);
            const options = { httpOnly: true, secure: true, sameSite: "strict" };

            return res
                .status(201)
                .cookie("accessToken", accessToken, {...options,maxAge: 15 * 60 * 1000})
                .cookie("refreshToken", refreshToken, {...options,maxAge: 7 * 24 * 60 * 60 * 1000})
                .cookie("role", createdUser.role, {...options,maxAge: 7 * 24 * 60 * 60 * 1000,httpOnly: false})
                .json(new ApiResponse(201, { user: createdUser, accessToken }, "User registered successfully"));

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
    initSuperAdmin: asyncHandler(async (req, res) => {
        try {

            let avatar;
            const avatarLocalPath = req?.files?.[0]?.fieldname.includes("avatar") ? req.files[0].path : undefined;
            if (avatarLocalPath) {
                const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath)
                avatar = uploadedAvatar?.url
            }
            console.log(req.body, "body")
            const dataToSend = { ...req.body }
            if (avatar) {
                dataToSend.avatar = avatar
            }
            const { createdUser, accessToken, refreshToken } = await authService.initSuperAdmin(dataToSend);
            const options = { httpOnly: true, secure: true, sameSite: "strict" };

            return res
                .status(201)
                .cookie("accessToken", accessToken, {...options,maxAge: 15 * 60 * 1000})
                .cookie("refreshToken", refreshToken, {...options,maxAge: 7 * 24 * 60 * 60 * 1000})
                .cookie("role", createdUser.role, {...options,maxAge: 7 * 24 * 60 * 60 * 1000,httpOnly: false})
                .json(new ApiResponse(201, { user: createdUser, accessToken }, "User registered successfully"));

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

    login: asyncHandler(async (req, res) => {
        try {


            const { user, accessToken, refreshToken } = await authService.login(req.body);

            const options = { httpOnly: true, secure: true, sameSite: "strict" };

            return res
                .status(200)
                .cookie("accessToken", accessToken, {...options,maxAge: 15 * 60 * 1000})
                .cookie("refreshToken", refreshToken, {...options,maxAge: 7 * 24 * 60 * 60 * 1000})
                .cookie("role", user.role, {...options,maxAge: 7 * 24 * 60 * 60 * 1000,httpOnly: false})
                .json(new ApiResponse(200, { user, accessToken }, "User logged in successfully"));
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
            if (!req.user?._id) {
                throw new ApiError(401, "Unauthorized request")
            }
            await authService.logoutUser(req.user._id);

            const options = { httpOnly: true, secure: true,sameSite: "strict" };

            return res
                .status(200)
                .clearCookie("accessToken",options)
                .clearCookie("refreshToken",options)
                .clearCookie("role",options)
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
            

            const { accessToken, refreshToken } = await authService.refreshAccessToken(req);

            const options = { httpOnly: true, secure: true, sameSite: "strict" };
            console.log(accessToken, refreshToken, "new tokens")

            return res
                .status(200)
                .cookie("accessToken", accessToken, {...options,maxAge: 15 * 60 * 1000})
                .cookie("refreshToken", refreshToken, {...options,maxAge: 7 * 24 * 60 * 60 * 1000})
                .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
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
            const data = { ...req.body, _id: req.user?._id };
            await authService.changeCurrentPassword(data);

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

export default authController;