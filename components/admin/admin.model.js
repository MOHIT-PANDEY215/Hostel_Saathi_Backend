import mongoose from "mongoose";
import { modelSchemaPattern } from "../../constants/model.js";

const adminSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
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
    userRole: {
      type: String,
      required: [true, "User Role is required"],
      default: 'admin'
    },
    refreshToken: {
      type: String,
    },
  },
  { strict: false, timestamps: true, collection: modelSchemaPattern.adminModel }
);

adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
  adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  
  adminSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        _id: this._id,
        hostelNumber: this.hostelNumber,
        userName:this.userName
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
  };
  adminSchema.methods.generateRefreshToken = function () {
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

const Admin = mongoose.model(modelSchemaPattern.adminModel, adminSchema);

export default Admin;