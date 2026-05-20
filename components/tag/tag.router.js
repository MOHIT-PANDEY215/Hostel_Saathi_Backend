import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { PERMISSIONS } from "../config/roles.config.js";

import { createTag, getTags, deleteTag } from "./tag.controller.js";

const router = express.Router();

router.post("/", verifyJWT, authorize(PERMISSIONS.MANAGE_TAGS), createTag);

router.get("/", verifyJWT, getTags);

router.delete(
  "/:id",
  verifyJWT,
  authorize(PERMISSIONS.MANAGE_TAGS),
  deleteTag,
);

export default router;
