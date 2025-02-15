import { BSON } from "bson";
import dotenv from "dotenv";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Worker from "./worker.model.js";

dotenv.config();

const timestamp = new Date().toISOString();

const workerController = {
  getAllWorkers: asyncHandler(async (req, res) => {
    try {
      const { pageNumber = 1, pageSize = 5, search, sort, role } = req.query;

      const page = parseInt(pageNumber) || 1;
      const perPage = parseInt(pageSize) || 5;
      const sortBy = { createdAt: -1 };
      const skipCount = (page - 1) * perPage;

      let queryParams = {};

      if (role) {
        queryParams.role = role;
      }

      if (search) {
        queryParams["$or"] = [{ fullName: { $regex: search, $options: "i" } }];
      }

      const totalItems = await Worker.countDocuments(queryParams);
      const totalPages = Math.ceil(totalItems / perPage);

      const ref = await Worker.aggregate([
        { $match: queryParams },
        { $sort: sortBy },
        { $skip: skipCount },
        { $limit: perPage },
      ]);

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            totalItems,
            totalPages,
            currentPage: page,
            ref,
          },
          "Workers fetched successfully"
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

  getWorkerById: asyncHandler(async (req, res) => {
    try {
      const { workerId } = req.query;
      if (!workerId) {
        throw new ApiError(400, "Worker ID is required");
      }

      const worker = await Worker.findById(workerId);
      if (!worker) {
        throw new ApiError(404, "Worker does not exist");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, worker, "Worker fetched successfully"));
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

export default workerController;
