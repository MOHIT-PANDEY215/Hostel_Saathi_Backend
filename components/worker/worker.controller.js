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
    const {
      pageNumber = 1,
      pageSize = 5,
      search,
      sort,
      role
    } = req.query;

    const page = parseInt(pageNumber);
    const perPage = parseInt(pageSize);
    const sortBy ={createdAt:-1};

    const skipCount = (page - 1) * perPage;

    let queryParams = {};

    if(role){
        queryParams={
            ...queryParams,
            role:role
        }
    }
    
    
    
    if (search) {
      queryParams["$or"] = [{ fullName: { $regex: search, $options: "i" } }];
    }
    const totalItems = await Worker.countDocuments(queryParams);
    const totalPages = Math.ceil(totalItems / perPage);

    let ref = await Worker.aggregate([
      {
        $match: queryParams,
      },
      {
        $sort: sortBy,
      },
      {
        $skip: skipCount,
      },
      {
        $limit: perPage,
      },
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalItems: totalItems,
          totalPages: totalPages,
          currentPage: page,
          ref: ref,
        },
        "Worker Fetched Successfully"
      )
    );
  }),
  getWorkerById: asyncHandler(async (req, res) => {
    const { workerId } = req.query;
    if (!workerId) {
      throw new ApiError(400, "Bad Input");
    }
    const worker = await Worker.findbyId(workerId);
    if (!worker) {
      throw new ApiError(404, "worker does not exists");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, worker, "worker Fetched Successfully"));
  }),
};

export default workerController;
