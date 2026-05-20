import mongoose from "mongoose";
import { modelSchemaPattern } from "../../../constants/model.js";

const bedSchema = mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
      index: true,
    },

    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
      index: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    bedNumber: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["vacant", "occupied", "maintenance"],
      default: "vacant",
      index: true,
    },

    occupiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
      index: true,
    },

    statusHistory: {
      type: [
        {
          status: {
            type: String,
            enum: ["occupied", "vacant", "maintenance"],
            required: true,
          },

          updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },

          occupiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            default: null,
          },

          note: String,

          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

  },
  { timestamps: true }
);

bedSchema.index(
  { roomId: 1, bedNumber: 1 },
  { unique: true }
); // A bed number must be unique within a room
bedSchema.index({ roomId: 1 }, { unique: false }); // A room can have multiple beds
bedSchema.index({ hostelId: 1, status: 1 });
bedSchema.index({ occupiedBy: 1 });



const Bed = mongoose.model(modelSchemaPattern.bedModel, bedSchema);


export default Bed;