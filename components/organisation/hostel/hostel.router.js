import { Router } from "express";
import { verifyJWT } from "../../../middleware/auth.middleware.js";
import hostelController from "./hostel.controller.js";
import { upload } from "../../../middleware/multer.middleware.js";


const hostelRouter = Router();

hostelRouter.post("/create", upload.any(), verifyJWT, hostelController.createHostel);
hostelRouter.get("/all", verifyJWT, hostelController.getAllHostels);



export default hostelRouter;
