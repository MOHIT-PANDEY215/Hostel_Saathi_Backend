import mongoose from "mongoose";
import { modelSchemaPattern } from "../../../constants/model.js";

const superAdminSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organisations: [
      {
        organisationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Organisation',
          required: true,
        },
        role: {
          type: String,
          enum: ["superadmin"],
          required: true,
        },
        onboardingStatus: {
          hasHostel: { type: Boolean, default: false },
          hasWarden: { type: Boolean, default: false },
          hasWorker: { type: Boolean, default: false },
        },
      },
    ],
  },
  { timestamps: true, collection: modelSchemaPattern.superAdminModel }
);

const SuperAdmin = mongoose.model(modelSchemaPattern.superAdminModel, superAdminSchema);

export default SuperAdmin;