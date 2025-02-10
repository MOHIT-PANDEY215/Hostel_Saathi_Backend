import { Router } from "express";
import issueController from "./issues.controller.js";
import { upload } from "../../middleware/multer.middleware.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";

const issueRouter = Router();

issueRouter.get("/all", issueController.getAllIssue);
issueRouter.get("/", issueController.getIssueById);
issueRouter.post("/", upload.any(), verifyJWT, issueController.postIssue);
issueRouter.post("/assign-worker", issueController.assignIssue);
issueRouter.post("/set-priority", issueController.setPriority);

export default issueRouter;
