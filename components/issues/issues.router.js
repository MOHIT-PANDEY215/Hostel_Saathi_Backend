import { Router } from "express";
import issueController from "./issues.controller.js";
import { upload } from "../../middleware/multer.middleware.js";

const issueRouter = Router();

issueRouter.get("/all", issueController.getAllIssue);
issueRouter.get("/", issueController.getIssueById);
issueRouter.post("/", upload.any(), issueController.postIssue);
issueRouter.post("/assign-worker", issueController.assignIssue);
issueRouter.post("/set-priority", issueController.setPriority);

export default issueRouter;
