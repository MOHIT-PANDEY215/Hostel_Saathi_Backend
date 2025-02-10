import mongoose from "mongoose";
import dotenv from "dotenv";
import { modelSchemaPattern } from "../../constants/model.js";
dotenv.config();

const studentSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Student name is required"],
    },
    registrationNumber: {
      type: String,
      unique: [true, "Regitration number should be unique"],
      required: [true, "Regitration number is required"],
    },
    hostelNumber: {
      type: Number,
      required: [true, "Hostel Number is required"],
    },
    avatar: {
      type: String,
    },
    mobileNumber: {
      type: String,
      unique: [true, "Mobile number should be unique"],
      required: [true, "Mobile number is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { strict: false, timestamps: true, collection: modelSchemaPattern.studentModel }
);

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

studentSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      registrationNumber: this.registrationNumber,
      hostelNumber: this.hostelNumber,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
studentSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const Student = mongoose.model(modelSchemaPattern.studentModel, studentSchema);

export default Student;
