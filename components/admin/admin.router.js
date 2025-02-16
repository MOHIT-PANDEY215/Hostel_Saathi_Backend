import { Router } from "express";
import adminController from "./admin.controller.js";
import { verifyAdmin, verifyJWT } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/multer.middleware.js";


const adminRouter = Router();

/**
 * @swagger
 * /api/v1/admin/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
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
 *               username:
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
 *         description: Admin registered successfully
 *       400:
 *         description: Insufficient credentials
 *       409:
 *         description: Admin already exists
 *       500:
 *         description: Internal server error
 */
adminRouter.post("/register", upload.any(),verifyJWT,verifyAdmin, adminController.registerAdmin);

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Log in an admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
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
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */
adminRouter.post("/login", adminController.loginAdmin);

/**
 * @swagger
 * /api/v1/admin/logout:
 *   post:
 *     summary: Logout the current admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin logged out successfully
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
adminRouter.post("/logout", verifyJWT, verifyAdmin, adminController.logoutUser);

/**
 * @swagger
 * /api/v1/admin/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Admin]
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
adminRouter.post("/refresh-token", adminController.refreshAccessToken);

/**
 * @swagger
 * /api/v1/admin/change-password:
 *   post:
 *     summary: Change the current admin's password
 *     tags: [Admin]
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
adminRouter.post("/change-password", verifyJWT,verifyAdmin, adminController.changeCurrentPassword);

/**
 * @swagger
 * /api/v1/admin/me:
 *   get:
 *     summary: Get the current logged-in admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin data retrieved successfully
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
adminRouter.get("/me", verifyJWT, verifyAdmin, adminController.getCurrentUser);

/**
 * @swagger
 * /api/v1/admin/all:
 *   get:
 *     summary: Get all admins (Paginated)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pageNumber
 *         in: query
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *         description: Number of admins per page
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search query for admin names
 *     responses:
 *       200:
 *         description: Admin retrieved successfully
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
adminRouter.get("/all", verifyJWT, verifyAdmin, adminController.getAllAdmin);

export default adminRouter;
