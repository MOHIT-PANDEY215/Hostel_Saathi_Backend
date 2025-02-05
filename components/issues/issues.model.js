import mongoose from "mongoose";

const issuesSchema = mongoose.Schema(
  {
    id: {
      type: String,
      unique: [true, 'Issue id should be unique'],
      required: [true, 'Issue id is required'],
    },
    hostelNumber: {
      type: Number,
      required: [true, 'Hostel Number is required'],
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
    },
    tags: {
      type: [String],
      // enum: ['electricity, sanitation, furniture, mess, equipments, co-curricular']
    },
    status: {
      type: String,
      enum: ['Pending', 'In-progress', 'Completed'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
    },
    dateAssigned: {
      type: Date,
    },
    dateCompleted: {
      type: Date,
    },
    dateAdded: {
      type: Date,
    },
    imageSrc: {
      type: String,
    },
  }, { Timestamp: true });

const Issue = mongoose.model("Issue", issuesSchema);

export default Issue;