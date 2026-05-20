import mongoose from "mongoose";
import { modelSchemaPattern } from "../../../constants/model.js";

const hostelSchema = mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    },
    
    hostelNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    totalRooms: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

hostelSchema.index(
  { organisationId: 1, hostelNumber: 1 },
  { unique: true }
);
hostelSchema.index({ organisationId: 1 }, { unique: false });

const Hostel = mongoose.model(modelSchemaPattern.hostelModel, hostelSchema);


export default Hostel;