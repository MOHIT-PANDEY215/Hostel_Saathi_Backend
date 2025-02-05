import mongoose from "mongoose";

const workerSchema = mongoose.Schema(
  {
    id: {
      type: String,
      unique: [true, 'Issue id should be unique'],
      required: [true, 'Issue id is required'],
    },
    name: {
      type: String,
      required: [true, 'Worker name is required'],
    },
    role: {
      type: String,
    },
    mobileNumber: {
      type: Number,
    },
  }, { Timestamp: true });

const Worker = mongoose.model("Worker", workerSchema);

export default Worker;