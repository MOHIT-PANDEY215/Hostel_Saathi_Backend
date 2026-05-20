import { Router } from "express";
// import studentController from "./student.controller.js";
// import { upload } from "../../middleware/multer.middleware.js";
import { verifyJWT } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";
import studentController from "./student.controller.js";

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
  "/create",
  upload.any(),
  studentController.createStudent
);


export default studentRouter;
