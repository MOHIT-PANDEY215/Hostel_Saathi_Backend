import { Router } from "express";
import { verifyJWT } from "../../../middleware/auth.middleware.js";
import superAdminController from "./superAdmin.controller.js";
import { authorize } from "../../../middleware/rbac.middleware.js";


const superAdminRouter = Router();

superAdminRouter.get(
    "/dashboard",
    verifyJWT,
    authorize(),
    superAdminController.getDashboard
);



export default superAdminRouter;
