import mongoose from "mongoose";
import { modelSchemaPattern } from "../../../constants/model.js";

const wardenSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    },
    hostelIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
      }
    ],
  },
  { timestamps: true, collection: modelSchemaPattern.wardenModel }
);

wardenSchema.index({ userId: 1 }, { unique: true }); // A warden can only be associated with one user
wardenSchema.index({ organisationId: 1 }, { unique: false }); // An organisation can have multiple wardens

const Warden = mongoose.model(modelSchemaPattern.wardenModel, wardenSchema);

export default Warden;