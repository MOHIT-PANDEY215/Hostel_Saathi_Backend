
import { ApiError } from "../../../utils/ApiError.js";
import User from "../../user/user.model.js";
import Bed from "../bed/bed.model.js";
import Room from "../room/room.model.js";
import Hostel from "./hostel.model.js";

const hostelService = {
    createHostel: async (data) => {
        const { user: loggedInUser } = data
        console.log("loggedInUser", loggedInUser)
        const { organisationId, hostelName, hostelNumber, hostelAddress } = data;
        if (
            [loggedInUser?._id, organisationId, hostelName, hostelNumber, hostelAddress].some(
                (field) => !field || field.trim() === ""
            )
        ) {
            throw new ApiError(400, "Insufficient credentials");
        }

        const [user, existingHostel] = await Promise.all([
            User.findById(loggedInUser?._id).select("role"),
            Hostel.findOne({
                organisationId,
                hostelNumber
            })
        ]);

        if (!user) throw new ApiError(404, "User not found");
        if (user.role !== "superadmin") {
            throw new ApiError(403, "Only superadmins can create hostels");
        }

        if (existingHostel) {
            throw new ApiError(400, "Hostel already exists");
        }

        const hostelPayload = {
            name: hostelName,
            organisationId: organisationId,
            hostelNumber: Number(hostelNumber),
            address: hostelAddress,
            createdBy: loggedInUser?._id,
        };
        const hostel = await Hostel.create(
            hostelPayload
        );
        if (!hostel) {
            throw new ApiError(500, "Hostel creation failed");
        }
        return hostel;
    },
    getAllHostels: async (data) => {
        const { user: loggedInUser } = data
        console.log("loggedInUser", loggedInUser)
        const orgId = loggedInUser?.organisationId;
        if (!orgId) {
            throw new ApiError(404, "Invalid Org id");
        }
        const hostels = Hostel.aggregate([
            {
                $match: {
                    organisationId: orgId
                }
            },
            {
                $lookup: {
                    from: Room.collection.name,
                    localField: "_id",
                    foreignField: "hostelId",
                    as: "rooms",
                },
            },

            {
                $lookup: {
                    from: Bed.collection.name,
                    let: { roomIds: "$rooms._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$roomId", "$$roomIds"],
                                },
                            },
                        },
                    ],
                    as: "beds",
                },
            },

            {
                $addFields: {
                    totalRooms: { $size: "$rooms" },
                    totalBeds: { $size: "$beds" },
                    occupiedBeds: {
                        $size: {
                            $filter: {
                                input: "$beds",
                                as: "bed",
                                cond: { $eq: ["$$bed.isOccupied", true] },
                            },
                        },
                    },
                },
            },

            {
                $addFields: {
                    occupancy: {
                        $cond: [
                            { $eq: ["$totalBeds", 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ["$occupiedBeds", "$totalBeds"] },
                                    100,
                                ],
                            },
                        ],
                    },
                },
            },
        ])
        return hostels;
    }
};

export default hostelService;