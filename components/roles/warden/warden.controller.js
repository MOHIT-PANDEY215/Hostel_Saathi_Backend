import dotenv from "dotenv";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";
import wardenService from "./warden.service.js";

dotenv.config();

const timestamp = new Date().toISOString();


const wardenController = {
  createWarden: asyncHandler(async (req, res) => {
    try {
      const user = req.user;
      if (!user?._id) {
        throw new ApiError(401, "Unauthorized");
      }
      const warden = await wardenService.createWarden({ ...req.body, user });

      return res
        .status(201)
        .json(new ApiResponse(201, { warden }, "Warden created successfully"));

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

  // getAllWarden: asyncHandler(async (req, res) => {
  //   try {
  //     const { pageNumber = 1, pageSize = 5, search, sort } = req.query;
  //     const page = parseInt(pageNumber);
  //     const perPage = parseInt(pageSize);
  //     const sortBy = getSortBy(sort);
  //     const skipCount = (page - 1) * perPage;
  //     const queryParams = {};
  //     const totalItems = await Admin.countDocuments(queryParams);
  //     const totalPages = Math.ceil(totalItems / perPage);

  //     let ref = await Admin.aggregate([
  //       { $match: queryParams },
  //       { $sort: sortBy },
  //       { $skip: skipCount },
  //       { $limit: perPage },
  //     ]);

  //     return res
  //       .status(200)
  //       .json(
  //         new ApiResponse(
  //           200,
  //           { totalItems, totalPages, currentPage: page, ref },
  //           "Admins fetched successfully"
  //         )
  //       );
  //   } catch (error) {
  //     const status = error.statusCode || 500;
  //     return res.status(status).json({
  //       success: false,
  //       message: error.message,
  //       timestamp: new Date().toISOString(),
  //     });
  //   }
  // }),
};

export default wardenController;
