
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import Warden from "../components/roles/warden/warden.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Student from "../components/roles/student/student.model.js";
import Worker from "../components/roles/worker/worker.model.js";
import SuperAdmin from "../components/roles/superAdmin/superAdmin.model.js";
import User from "../components/user/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      throw new ApiError(401, "Invalid access token");
    }
    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid user");
    }

    req.user = user;
    // attachUser(req,res,next);


    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid access token",
      timestamp: new Date().toISOString(),
    });
  }
});


export const attachUser = async (req, res, next) => {
  const { _id, role } = req.user;

  let user;

  if (role === "student") user = await Student.findOne({ userId: _id });
  if (role === "warden") user = await Warden.findOne({ userId: _id });
  if (role === "worker") user = await Worker.findOne({ userId: _id });
  if (role === "superadmin") user = await SuperAdmin.findOne({ userId: _id });

  req.fullUser = user;

  next();
};
