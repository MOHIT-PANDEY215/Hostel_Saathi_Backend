import { BSON } from "bson";
import dotenv from "dotenv";
import Issue from "./issues.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getSortBy } from "../../utils/helper.js";

dotenv.config();

const timestamp = new Date().toISOString();

const issueController = {
  getAllIssue: asyncHandler(async (req, res) => {
    try {
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

      const completedFilter =
        isCompleted === "true"
          ? true
          : isCompleted === "false"
          ? false
          : undefined;
      const assignedFilter =
        isAssigned === "true"
          ? true
          : isAssigned === "false"
          ? false
          : undefined;

      const queryParams = {};

      if (hostelNumber) queryParams.hostelNumber = Number(hostelNumber);
      if (completedFilter !== undefined)
        queryParams.isCompleted = completedFilter;
      if (assignedFilter !== undefined) queryParams.isAssigned = assignedFilter;
      if (search) {
        queryParams["$or"] = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ];
      }

      const totalItems = await Issue.countDocuments(queryParams);
      const totalPages = Math.ceil(totalItems / perPage);

      let ref = await Issue.aggregate([
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
            "Issues fetched successfully"
          )
        );
    } catch (error) {
      console.error(error);
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }),

  getIssueById: asyncHandler(async (req, res) => {
    try {
      const { issueId } = req.query;
      if (!issueId) throw new ApiError(400, "Bad Input");

      const issue = await Issue.findById(issueId);
      if (!issue) throw new ApiError(404, "Issue does not exist");

      return res
        .status(200)
        .json(new ApiResponse(200, issue, "Issue fetched successfully"));
    } catch (error) {
      console.error(error);
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }),

  postIssue: asyncHandler(async (req, res) => {
    try {
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

      let imageURLs = [];

      if (req.files) {
        for (const file of req.files) {
          if (file.fieldname.includes("issueImage")) {
            let imageUrl = await uploadOnCloudinary(file.path);
            imageURLs.push(imageUrl);
          }
        }
      }

      if (issueId) {
        const prevIssue = await Issue.findById(issueId);
        if (!prevIssue) throw new ApiError(404, "Issue does not exist");

        let issueParams = {
          title: title || prevIssue.title,
          description: description || prevIssue.description,
          hostelNumber: Number(hostelNumber) || Number(prevIssue.hostelNumber),
          tags: tags || prevIssue.tags || [],
          status: status || prevIssue.status || "Pending",
          priority: prevIssue.priority || "Low",
        };

        if (isCompleted) {
          issueParams = {
            ...issueParams,
            isCompleted: true,
            dateCompleted: prevIssue.dateCompleted || new Date(),
          };
        }

        const newIssue = await Issue.findOneAndUpdate(
          { _id: issueId },
          issueParams,
          { new: true }
        );
        return res
          .status(200)
          .json(new ApiResponse(200, newIssue, "Issue modified successfully"));
      } else {
        if (!title || !description || !hostelNumber)
          throw new ApiError(400, "Provide all required fields");

        const issueParams = {
          title,
          description,
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
          .json(new ApiResponse(200, newIssue, "Issue created successfully"));
      }
    } catch (error) {
      console.error(error);
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }),

  assignIssue: asyncHandler(async (req, res) => {
    try {
      const user = req.user;
      if (user?.userRole !== "admin") throw new ApiError(403, "Access Denied");

      const { issueId, isAssigned, workerName, workerMobNo, workerRole } =
        req.body;
      if (!issueId || !workerMobNo || !workerName || !workerRole)
        throw new ApiError(400, "Insufficient data");

      const issue = await Issue.findById(issueId);
      if (!issue) throw new ApiError(404, "Issue does not exist");

      let assignedTo = await Worker.findOne({
        fullName: workerName,
        mobileNumber: workerMobNo,
        role: workerRole,
      });
      if (!assignedTo) {
        assignedTo = await Worker.create({
          fullName: workerName,
          mobileNumber: workerMobNo,
          role: workerRole,
          userRole: "worker",
        });
      }

      const newIssue = await Issue.findByIdAndUpdate(
        issueId,
        { dateAssigned: new Date(), assignedBy: user, assignedTo, isAssigned },
        { new: true }
      );

      return res
        .status(200)
        .json(new ApiResponse(200, newIssue, "Worker assigned successfully"));
    } catch (error) {
      console.error(error);
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }),

  setPriority: asyncHandler(async (req, res) => {
    try {
      const user = req.user;
      if (user?.userRole !== "admin") throw new ApiError(403, "Access Denied");

      const { issueId, priority } = req.body;
      if (!issueId || !priority) throw new ApiError(400, "Bad input");

      const issue = await Issue.findById(issueId);
      if (!issue) throw new ApiError(404, "Issue does not exist");

      const newIssue = await Issue.findByIdAndUpdate(
        issueId,
        { priority },
        { new: true }
      );
      return res
        .status(200)
        .json(new ApiResponse(200, newIssue, "Priority set successfully"));
    } catch (error) {
      console.error(error);
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }),
};

export default issueController;
