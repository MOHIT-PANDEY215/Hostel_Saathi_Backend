import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

const issuesSchema = mongoose.Schema(
  {
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
    isCompleted:{
      type:Boolean,
    },
    isAssigned:{
      type:Boolean,
    },
    dateAssigned: {
      type: Date,
    },
    dateCompleted: {
      type: Date,
    },
    images: {
      type: [String],
    },
  }, {strict: false, timestamps:true , collection: process.env.issueModel });
  
  const Issue = mongoose.model(process.env.issueModel, issuesSchema);


export default Issue;

