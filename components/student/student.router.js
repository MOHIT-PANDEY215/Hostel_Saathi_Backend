import { Router } from "express";
import studentController from "./student.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/multer.middleware.js";

const studentRouter = Router();

studentRouter.post(
  "/register",
  upload.any(),
  studentController.registerStudent
);
studentRouter.post("/login", studentController.loginStudent);

//secured routes
studentRouter.post("/logout", verifyJWT, studentController.logoutUser);
studentRouter.post("/refresh-token", studentController.refreshAccessToken);
studentRouter.post(
  "/change-password",
  verifyJWT,
  studentController.changeCurrentPassword
);
studentRouter.get("/me", verifyJWT, studentController.getCurrentUser);
export default studentRouter;
