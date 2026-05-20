import { Router } from "express";
import { upload } from "../../../middleware/multer.middleware.js";
import wardenController from "./warden.controller.js";
import { verifyJWT } from "../../../middleware/auth.middleware.js";


const wardenRouter = Router();

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
wardenRouter.post("/create", upload.any(),verifyJWT, wardenController.createWarden);



export default wardenRouter;
