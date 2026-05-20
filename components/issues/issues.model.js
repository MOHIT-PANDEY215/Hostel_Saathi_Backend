import mongoose from "mongoose";
import dotenv from "dotenv";
import { modelSchemaPattern } from "../../constants/model.js";
dotenv.config();

const issuesSchema = mongoose.Schema(
  {
    hostelId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel'
    },
    organisationId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation'
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    customTag: {
      type: String,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },

    status: {
      type: String,
      enum: [
        "REPORTED",
        "VERIFIED",
        "ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED",
        "AWAITING_VERIFICATION",
        "CLOSED",
        "REJECTED",
        "REOPENED",
      ],
      default: "REPORTED",
    },

    // reportedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: modelSchemaPattern.studentModel,
    //   required: true,
    // },

    // verifiedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: modelSchemaPattern.adminModel,
    // },

    // assignedTo: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: modelSchemaPattern.workerModel,
    // },

    // closedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: modelSchemaPattern.adminModel,
    // },
    closureReason: {
      type: String,
    },

    verifiedAt: Date,
    assignedAt: Date,
    startedAt: Date,
    resolvedAt: Date,
    closedAt: Date,

    statusHistory: [
      {
        status: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "statusHistory.userModel",
        },
        userModel: {
          type: String,
          enum: [
            modelSchemaPattern.studentModel,
            modelSchemaPattern.adminModel,
            modelSchemaPattern.workerModel,
          ],
        },
        note: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    comments: [
      {
        message: String,
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "comments.userModel",
        },
        userModel: {
          type: String,
          enum: [
            modelSchemaPattern.studentModel,
            modelSchemaPattern.adminModel,
            modelSchemaPattern.workerModel,
          ],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    attachments: [
      {
        url: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "attachments.userModel",
        },
        userModel: {
          type: String,
          enum: [
            modelSchemaPattern.studentModel,
            modelSchemaPattern.workerModel,
          ],
        },
      },
    ],
  },
  { timestamps: true, collection: modelSchemaPattern.issueModel },
);

issuesSchema.index({ hostelNumber: 1, status: 1 });
issuesSchema.index({ reportedBy: 1 });
issuesSchema.index({ assignedTo: 1 });

const Issue = mongoose.model(modelSchemaPattern.issueModel, issuesSchema);

export default Issue;
