import mongoose from "mongoose";
import dotenv from "dotenv";
import { modelSchemaPattern } from "../../constants/model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
dotenv.config();

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim:true,
    },
    userName: {
      type: String,
      required: true,
      trim:true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    avatar: String,

    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "worker", "warden", "superadmin"],
      required: true,
    },
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: function(){ return this.role!=='superadmin'},
      default:null,
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      default: null,

    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    refreshToken: String,
  },
  { timestamps: true, collection: modelSchemaPattern.userModel }
);

userSchema.index({ userName: 1, organisationId: 1,mobileNumber:1 }, { unique: true });//for a given organisation, userName and mobileNumber should be unique
userSchema.index({ mobileNumber:1 }, { unique: true });//mobileNumber should be unique across the entire database
userSchema.index({ organisationId: 1 }, { unique: false });// an organisation can have multiple users
userSchema.index({ createdBy: 1 }, { unique: false });// a user can create multiple users
userSchema.index({ hostelId: 1 }, { unique: false });// a hostel can have multiple users
userSchema.index({ role: 1 }, { unique: false });// multiple users can have the same role
userSchema.index({ organisationId: 1,hostelId: 1 }, { unique: false });// an organisation can have multiple hostels and a hostel can have multiple users
userSchema.index({ organisationId: 1, role: 1 }, { unique: false });// an organisation can have multiple users with the same role
userSchema.index({ hostelId: 1, role: 1 }, { unique: false });// a hostel can have multiple users with the same role


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Methods
userSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      organisationId: this.organisationId,
      hostelId: this.hostelId,

    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};
const User = mongoose.model(modelSchemaPattern.userModel, userSchema);

export default User;
