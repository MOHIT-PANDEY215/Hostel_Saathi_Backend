import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError.js";
import User from "../../user/user.model.js";
import Hostel from "../hostel/hostel.model.js";
import Organisation from "../organisation.model.js";
import Room from "./room.model.js";
import Bed from "../bed/bed.model.js";

const roomService = {
    createRoom: async (data) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const { user: loggedInUser, organisationId, hostelId, block, floor, roomNumber, capacity } = data;
            if (!loggedInUser) {
                throw new ApiError(403, "Unauthorised");
            }
            if (
                [organisationId, hostelId, block, floor, roomNumber, capacity].some(
                    (field) => !field || field.trim() === ""
                )
            ) {
                throw new ApiError(400, "Insufficient credentials");
            }

            if (loggedInUser?.role !== "superadmin" && loggedInUser?.role !== "warden") {
                throw new ApiError(403, "Only superadmins and wardens can create rooms");
            }

            const [existingRoom, hostel] = await Promise.all([
                Room.findOne({
                    organisationId,
                    hostelId,
                    roomNumber
                }).session(session),
                Hostel.findOne({
                    _id: hostelId,
                    organisationId
                }).session(session),
                // Organisation.findById(organisationId).session(session),
            ]);

            if (existingRoom) {
                throw new ApiError(400, "Room already exists");
            }
            // if (!organisation) throw new ApiError(404, "Organisation not found");
            if (!hostel) throw new ApiError(404, "Hostel not found");

            const roomPayload = {
                organisationId: organisationId,
                hostelId: hostelId,
                block: block,
                floor: floor,
                roomNumber: Number(roomNumber),
                capacity: Number(capacity),
                createdBy: loggedInUser?._id,
            };
            const room = await Room.create(
                [roomPayload], { session }
            );
            if (!room || room.length === 0) {
                throw new ApiError(500, "Room creation failed");
            }

            const createdRoom = room[0];

            const bedsPayload = Array.from({ length: Number(capacity) }, (_, i) => ({
                organisationId,
                hostelId,
                roomId: createdRoom._id,
                bedNumber: `B${i + 1}`,
                status: "vacant",
                occupiedBy: null,
                createdBy: loggedInUser._id,
            }));

            const beds = await Bed.insertMany(bedsPayload, { session });

            if (!beds || beds.length !== Number(capacity)) {
                throw new ApiError(500, "Bed creation failed");
            }


            await session.commitTransaction();
            session.endSession();

            return {
                room: createdRoom,
                beds,
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(500, "Create room failed: " + error.message);
        }

    }
};

export default roomService;