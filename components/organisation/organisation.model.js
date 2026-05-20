import mongoose from "mongoose";
import { modelSchemaPattern } from "../../constants/model.js";

const organisationSchema = mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim:true,
    }
  },
  { timestamps: true }
);

organisationSchema.index({ createdBy: 1, name: 1 }, { unique: true });
organisationSchema.index({ createdBy: 1 }, { unique: false });

const Organisation = mongoose.model(modelSchemaPattern.organisationModel, organisationSchema);


export default Organisation;