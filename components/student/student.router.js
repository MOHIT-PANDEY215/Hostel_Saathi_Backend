import { Router } from "express";
import studentController from "./student.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/multer.middleware.js";

const studentRouter = Router();

/**
 * @swagger
 * /api/v1/student/register:
 *   post:
 *     summary: Register a new student
 *     tags: [Students]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               registrationNumber:
 *                 type: string
 *               password:
 *                 type: string
 *               mobileNumber:
 *                 type: string
 *               hostelNumber:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       400:
 *         description: Insufficient credentials
 *       409:
 *         description: Student already exists
 *       500:
 *         description: Internal server error
 */
studentRouter.post(
  "/register",
  upload.any(),
  studentController.registerStudent
);

/**
 * @swagger
 * /api/v1/student/login:
 *   post:
 *     summary: Log in a student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registrationNumber:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Insufficient credentials
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
studentRouter.post("/login", studentController.loginStudent);

/**
 * @swagger
 * /api/v1/student/logout:
 *   post:
 *     summary: Logout the current student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student logged out successfully
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
studentRouter.post("/logout", verifyJWT, studentController.logoutUser);

/**
 * @swagger
 * /api/v1/student/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
studentRouter.post("/refresh-token", studentController.refreshAccessToken);

/**
 * @swagger
 * /api/v1/student/change-password:
 *   post:
 *     summary: Change the current student's password
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid old password
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
studentRouter.post(
  "/change-password",
  verifyJWT,
  studentController.changeCurrentPassword
);

/**
 * @swagger
 * /api/v1/student/me:
 *   get:
 *     summary: Get the current logged-in student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student data retrieved successfully
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
studentRouter.get("/me", verifyJWT, studentController.getCurrentUser);

export default studentRouter;
