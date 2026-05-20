import mongoose from "mongoose";
import { modelSchemaPattern } from "../../../constants/model.js";

const roomSchema = mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    block: {
      type: String,
      default: null,
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

roomSchema.index(
  { hostelId: 1, roomNumber: 1 },
  { unique: true }
);
roomSchema.index({ hostelId: 1 }, { unique: false });
roomSchema.index({ organisationId: 1 }, { unique: false });

const Room = mongoose.model(modelSchemaPattern.roomModel, roomSchema);


export default Room;