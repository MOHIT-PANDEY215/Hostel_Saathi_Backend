import { Router } from "express";
import bedController from "./bed.controller.js";
import { upload } from "../../../middleware/multer.middleware.js";
import { verifyJWT } from "../../../middleware/auth.middleware.js";


const bedRouter = Router();

bedRouter.post("/create", upload.any(), verifyJWT, bedController.createBed);
bedRouter.get("/all", verifyJWT, bedController.getAllBeds);



export default bedRouter;
