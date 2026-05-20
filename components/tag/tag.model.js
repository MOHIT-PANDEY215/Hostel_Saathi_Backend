import mongoose from "mongoose";
import { modelSchemaPattern } from "../../constants/model";

const tagSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    color: {
      type: String,
      default: "#3b82f6",
    },

    // hostelNumber: {
    //   type: Number,
    //   required: true,
    //   index: true, 
    // },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

tagSchema.index({ hostelNumber: 1, slug: 1 }, { unique: true });

const Tag = mongoose.model(modelSchemaPattern.tagModel, tagSchema);

export default Tag;