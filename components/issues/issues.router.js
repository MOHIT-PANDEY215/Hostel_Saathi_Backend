import { Router } from "express";
import issueController from "./issues.controller.js";
import { upload } from "../../middleware/multer.middleware.js";
import { verifyAdmin, verifyJWT } from "../../middleware/auth.middleware.js";

const issueRouter = Router();

/**
 * @swagger
 * /api/v1/issue/all:
 *   get:
 *     summary: Get all issues
 *     description: Fetch all issues with optional filters such as status, assigned state, hostel number, search query, and sorting.
 *     tags:
 *       - Issues  
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *         description: The page number (default is 1).
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Number of issues per page (default is 5).
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search issues by title, description, or tags.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by a field (e.g., createdAt, priority).
 *       - in: query
 *         name: isCompleted
 *         schema:
 *           type: boolean
 *         description: Filter by completion status.
 *       - in: query
 *         name: isAssigned
 *         schema:
 *           type: boolean
 *         description: Filter by assignment status.
 *       - in: query
 *         name: hostelNumber
 *         schema:
 *           type: integer
 *         description: Filter by hostel number.
 *     responses:
 *       200:
 *         description: A list of issues with pagination details.
 */
issueRouter.get("/all", verifyJWT, issueController.getAllIssue);

/**
 * @swagger
 * /api/v1/issue:
 *   get:
 *     summary: Get issue by ID
 *     description: Fetch a specific issue using its ID.
 *     tags:
 *       - Issues
 *     parameters:
 *       - in: query
 *         name: issueId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the issue to retrieve.
 *     responses:
 *       200:
 *         description: Issue details.
 *       404:
 *         description: Issue not found.
 */
issueRouter.get("/", issueController.getIssueById);

/**
 * @swagger
 * /api/v1/issue:
 *   post:
 *     summary: Create or update an issue
 *     description: Allows a student to report a new issue or update an existing issue.
 *     tags:
 *       - Issues
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               issueId:
 *                 type: string
 *                 example: "65a8b9e5f3d3c9aabbcc1122"
 *               title:
 *                 type: string
 *                 example: "Broken Window"
 *               description:
 *                 type: string
 *                 example: "The window in my room is broken."
 *               hostelNumber:
 *                 type: integer
 *                 example: 5
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["maintenance", "urgent"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Issue created or updated successfully.
 */
issueRouter.post("/", upload.any(), verifyJWT, issueController.postIssue);

/**
 * @swagger
 * /api/v1/issue/assign-worker:
 *   post:
 *     summary: Assign a worker to an issue
 *     description: Assigns a worker to an existing issue (Admin only).
 *     tags:
 *       - Issues
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               issueId:
 *                 type: string
 *                 example: "65a8b9e5f3d3c9aabbcc1122"
 *               workerName:
 *                 type: string
 *                 example: "John Doe"
 *               workerMobNo:
 *                 type: string
 *                 example: "9876543210"
 *               workerRole:
 *                 type: string
 *                 example: "Plumber"
 *     responses:
 *       200:
 *         description: Worker assigned successfully.
 */
issueRouter.post("/assign-worker", verifyJWT, verifyAdmin, issueController.assignIssue);

/**
 * @swagger
 * /api/v1/issue/set-priority:
 *   post:
 *     summary: Set priority for an issue
 *     description: Updates the priority level of an issue (Admin only).
 *     tags:
 *       - Issues
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               issueId:
 *                 type: string
 *                 example: "65a8b9e5f3d3c9aabbcc1122"
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 example: "High"
 *     responses:
 *       200:
 *         description: Priority updated successfully.
 */
issueRouter.post("/set-priority", verifyJWT, verifyAdmin, issueController.setPriority);

export default issueRouter;
