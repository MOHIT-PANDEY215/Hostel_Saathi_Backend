import mongoose from "mongoose";

const studentSchema = mongoose.Schema(
  {
    id: {
      type: String,
      unique: [true, 'Student id should be unique'],
      required: [true, 'Student id is required'],
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
    },
    regitrationNumber: {
      type: String,
      unique: [true, 'Regitration number should be unique'],
      required: [true, 'Regitration number is required'],
    },
    hostelNumber: {
      type: Number,
      required: [true, 'Hostel Number is required'],
    },
    image: {
      type: String,
    },
    mobileNumber: {
      type: String,
      unique: [true, 'Mobile number should be unique'],
      required: [true, 'Mobile number is required'],
    },
  }, { Timestamp: true });

const Student = mongoose.model("Student", studentSchema);

export default Student;