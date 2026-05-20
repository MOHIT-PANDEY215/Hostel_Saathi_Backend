import mongoose from "mongoose";
import { modelSchemaPattern } from "../../../constants/model.js";

const workerSchema = mongoose.Schema(
  {
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    // hostelNumber: {
    //   type: Number,
    //   required: true,
    //   index: true
    // },
  },
  { timestamps: true, collection: modelSchemaPattern.workerModel }
);
workerSchema.index({ userId: 1 }, { unique: true }); // A worker can only be associated with one user
workerSchema.index({ organisationId: 1 }, { unique: false }); // An organisation can have multiple workers
workerSchema.index({ department: 1 }, { unique: false }); // Multiple workers can belong to the same department

const Worker = mongoose.model(modelSchemaPattern.workerModel, workerSchema);

export default Worker;