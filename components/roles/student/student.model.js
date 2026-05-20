import mongoose from "mongoose";
import dotenv from "dotenv";
import { modelSchemaPattern } from "../../../constants/model.js";
dotenv.config();

const studentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
    },
    organistaionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    bedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
    },
  },
  { timestamps: true, collection: modelSchemaPattern.studentModel }
);

studentSchema.index(
  { registrationNumber: 1, organisationId: 1 },
  { unique: true }
); // A student with the same registration number cannot exist in the same organisation
studentSchema.index({ userId: 1 }, { unique: true }); // A student can only be associated with one user
studentSchema.index({ organistaionId: 1 }, { unique: false }); // An organisation can have multiple students
studentSchema.index({ hostelId: 1 }, { unique: false }); // A hostel can have multiple students
studentSchema.index({ roomId: 1 }, { unique: false }); // A room can have multiple students


const Student = mongoose.model(modelSchemaPattern.studentModel, studentSchema);

export default Student;
