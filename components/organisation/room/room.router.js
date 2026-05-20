import { Router } from "express";
import { verifyJWT } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";
import roomController from "./room.controller.js";


const roomRouter = Router();

roomRouter.post("/create", upload.any(), verifyJWT, roomController.createRoom);



export default roomRouter;
