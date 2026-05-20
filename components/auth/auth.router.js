import { Router } from "express";
import authController from "./auth.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/multer.middleware.js";

const authRouter = Router();

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
authRouter.post(
  "/signup",
  upload.any(),
  authController.signup
);

authRouter.post(
  "/get-started",
  upload.any(),
  authController.initSuperAdmin
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
authRouter.post("/login", authController.login);

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
authRouter.post("/logout", verifyJWT, authController.logoutUser);

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
authRouter.post("/refresh", authController.refreshAccessToken);


export default authRouter;
