import mongoose from "mongoose";

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
  }, {strict: false, timestamps:true , collection: process.env.workerModel });

const Worker = mongoose.model(process.env.workerModel, workerSchema);

export default Worker;