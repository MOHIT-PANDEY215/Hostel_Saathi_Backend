
import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError.js";
import Hostel from "../../organisation/hostel/hostel.model.js";
import Organisation from "../../organisation/organisation.model.js";
import User from "../../user/user.model.js";
import Warden from "./warden.model.js";


const wardenService = {
    createWarden: async (data) => {
        const session = await mongoose.startSession();
        try {
            let wardenUser;
            let warden;

            await session.withTransaction(async () => {
                const {
                    user: loggedInUser,
                    organisationId,
                    hostelId,
                    wardenFullName,
                    wardenUserName,
                    wardenPassword,
                    wardenMobileNumber,
                } = data;

                if (
                    [
                        loggedInUser?._id,
                        organisationId,
                        hostelId,
                        wardenFullName,
                        wardenUserName,
                        wardenPassword,
                        wardenMobileNumber,
                    ].some((field) => !field || field.toString().trim() === "")
                ) {
                    throw new ApiError(400, "Insufficient credentials");
                }

                const user = await User.findById(loggedInUser?._id)
                    .select("role")
                    .session(session);

                if (!user) throw new ApiError(404, "User not found");

                if (user.role !== "superadmin") {
                    throw new ApiError(403, "Only superadmins can create wardens");
                }

                const existingWarden = await User.findOne({
                    $or: [
                        { userName: wardenUserName },
                        { mobileNumber: wardenMobileNumber },
                    ],
                }).session(session);

                if (existingWarden) {
                    throw new ApiError(400, "Warden already exists");
                }

                const organisation = await Organisation.findById(organisationId).session(session);
                if (!organisation) throw new ApiError(404, "Organisation not found");

                const hostel = await Hostel.findOne({
                    _id: hostelId,
                    organisationId,
                }).session(session);

                if (!hostel) throw new ApiError(404, "Hostel not found");

                const wardenUserPayload = {
                    fullName: wardenFullName,
                    userName: wardenUserName,
                    password: wardenPassword,
                    mobileNumber: wardenMobileNumber,
                    organisationId: organisationId,
                    role: "warden",
                };

                wardenUser = await new User(wardenUserPayload).save({ session });

                const wardenPayload = {
                    userId: wardenUser?._id,
                    organisationId: organisation?._id,
                    hostelIds: [hostel?._id],
                };

                warden = await new Warden(wardenPayload).save({ session });
            });

            session.endSession();

            return {
                wardenId: warden._id,
                wardenUserId: wardenUser._id,
                wardenUserName: wardenUser.userName,
                wardenMobileNumber: wardenUser.mobileNumber,
            };

        } catch (error) {
            // await session.abortTransaction();
            session.endSession();
            if (error.code === 11000) {
                throw new ApiError(400, "Duplicate field value");
            }
            throw new ApiError(500, "Warden creation failed: " + error.message);
        }

    }
};

export default wardenService;