import mongoose from "mongoose";
import { modelSchemaPattern } from "../../constants/model.js";

const workerSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Worker name is required'],
    },
    role: {
      type: String,
    },
    mobileNumber: {
      type: Number,
    },
    userRole: {
      type: String,
      required: [true, "User Role is required"],
      default: 'worker'
    },    
  }, {strict: false, timestamps:true , collection: modelSchemaPattern.workerModel });

const Worker = mongoose.model(modelSchemaPattern.workerModel, workerSchema);

export default Worker;