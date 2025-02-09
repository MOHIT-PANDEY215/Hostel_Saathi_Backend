import { BSON } from "bson";
import dotenv from "dotenv";
import Issue from "./issues.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

dotenv.config();

const timestamp = new Date().toISOString();

const getSortBy = (sort) => {
  let sortBy;
  switch (sort) {
    case "dateAssigned":
      sortBy = { dateAssigned: -1 };
      break;
    case "dateCompleted":
      sortBy = { dateCompleted: -1 };
      break;
    default:
      sortBy = { createdAt: -1 };
      break;
  }
  return sortBy;
};

const issueController = {
  getAllIssue: asyncHandler(async (req, res) => {
    const {
      pageNumber = 1,
      pageSize = 5,
      search,
      sort,
      isCompleted,
      isAssigned,
      hostelNumber,
    } = req.query;

    const page = parseInt(pageNumber);
    const perPage = parseInt(pageSize);
    const sortBy = getSortBy(sort);

    const skipCount = (page - 1) * perPage;

    let queryParams = {};

    if (hostelNumber) {
      queryParams = {
        ...queryParams,
        hostelNumber: Number(hostelNumber),
      };
    }
    if (isCompleted === false) {
      queryParams = {
        ...queryParams,
        isCompleted: false,
      };
    } else if (isCompleted === true) {
      queryParams = {
        ...queryParams,
        isCompleted: true,
      };
    }
    if (isAssigned === false) {
      queryParams = {
        ...queryParams,
        isAssigned: false,
      };
    } else if (isAssigned === true) {
      queryParams = {
        ...queryParams,
        isAssigned: true,
      };
    }
    if (search) {
      queryParams["$or"] = [{ title: { $regex: search, $options: "i" } }];
    }
    const totalItems = await Issue.countDocuments(queryParams);
    const totalPages = Math.ceil(totalItems / perPage);

    let ref = await Issue.aggregate([
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
        "Issue Fetched Successfully"
      )
    );
  }),
  getIssueById: asyncHandler(async (req, res) => {
    const { issueId } = req.query;
    if (!issueId) {
      throw new ApiError(400, "Bad Input");
    }
    const issue = await Issue.findbyId(issueId);
    if (!issue) {
      throw new ApiError(404, "Issue does not exists");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, issue, "Issue Fetched Successfully"));
  }),
  postIssue: asyncHandler(async (req, res) => {
    const user = req.user;
    const {
      issueId,
      title,
      description,
      hostelNumber,
      tags,
      status,
      isCompleted,
    } = req.body;

    if (issueId) {
      const prevIssue = await Issue.findbyId(issueId);
      if (!prevIssue) {
        throw new ApiError(404, "issue does not exists");
      }

      let imageURLs = [];
      if (req.body.imageUrls) {
        imageURLs = [req.body.images];
      }

      for (const file of req.files) {
        let imageUrl;
        if (file.fieldname.includes("issueImage")) {
          imageUrl = await uploadOnCloudinary(file.path);
          imageURLs.push(imageUrl);
        }
      }

      const issueParams = {
        title: title || prevIssue?.title,
        description: description || prevIssue?.description,
        hostelNumber: Number(hostelNumber) || Number(prevIssue?.hostelNumber),
        tags: tags || prevIssue?.tags || [],
        status: status || prevIssue?.status || "Pending",
        priority: priority || prevIssue?.priority || "Low",
      };
      if (isCompleted && isAssigned) {
        issueParams = {
          ...issueParams,
          isCompleted: true,
          dateCompleted: prevIssue?.dateCompleted || new Date.now(),
        };
      }

      const newIssue = await Issue.findOneAndUpdate(
        {
          _id: issueId,
        },
        issueParams
      );

      return res
        .status(200)
        .json(new ApiResponse(200, newIssue, "Issue modified Successfully"));
    } else {
      if (!title || !description || !hostelNumber) {
        throw new ApiError(400, "Provide all required fields");
      }

      let imageURLs = [];

      for (const file of req.files) {
        let imageUrl;
        if (file.fieldname.includes("issueImage")) {
          imageUrl = await uploadOnCloudinary(file.path);
          imageURLs.push(imageUrl);
        }
      }

      const issueParams = {
        title: title,
        description: description,
        hostelNumber: Number(hostelNumber),
        raisedBy: user,
        tags: tags || [],
        status: "Pending",
        images: imageURLs,
        isCompleted: false,
        isAssigned: false,
      };

      const newIssue = await Issue.create(issueParams);

      return res
        .status(200)
        .json(new ApiResponse(200, newIssue, "Issue created Successfully"));
    }
  }),
  assignIssue: asyncHandler(async (req, res) => {
    const user = req.user;
    const { issueId, isAssigned, workerName, workerMobNo, workerRole } =
      req.body;
    if (!issueId || !workerMobNo || !workerName || !workerRole) {
      throw new ApiError(400, "Insufficient data");
    }
    const issue = await Issue.findOne({
      _id: issueId,
    });
    if (!issue) {
      throw new ApiError(404, "issue does not exists");
    }
    let assignedTo = {
      fullName: workerName,
      mobileNumber: workerMobNo,
      role: workerRole,
    };
    const isWorkerExists = await Worker.findOne({
      fullName: workerName,
      mobileNumber: workerMobNo,
      role: workerRole,
    });
    if (!isWorkerExists) {
      const newWorker = await Worker.create({
        fullName: workerName,
        mobileNumber: workerMobNo,
        role: workerRole,
      });
      assignedTo = newWorker;
    } else assignedTo = isWorkerExists;
    /*
    date assigned 
    assigned by
    assigned to
    */
    const newIssue = await Issue.findOneAndUpdate(
      {
        _id: issueId,
      },
      {
        dateAssigned: new Date.now(),
        assignedBy: user,
        assignedTo: assignedTo,
        isAssigned: isAssigned,
      }
    );

    return res
      .status(201)
      .json(new ApiResponse(200, newIssue, "Worker assigned Successfully"));
  }),
  setPriority: asyncHandler(async (req, res) => {
    const { issueId, priority } = req.body;
    if (!issueId || !priority) {
      throw new ApiError(400, "Bad input");
    }
    const issue = await Issue.findbyId(issueId);
    if (!issue) {
      throw new ApiError(404, "Issue does not exists");
    }
    const newIssue = await Issue.findOneAndUpdate(
      {
        _id: issueId,
      },
      {
        priority: priority,
      }
    );
    return res
      .status(201)
      .json(new ApiResponse(200, newIssue, "Priority set Successfully"));
  }),
};

export default issueController;
