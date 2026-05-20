import { Router } from "express";
import authController from "../auth/auth.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/multer.middleware.js";

const userRouter = Router();


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
userRouter.post(
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
userRouter.get("/me", verifyJWT, studentController.getCurrentUser);

export default userRouter;
