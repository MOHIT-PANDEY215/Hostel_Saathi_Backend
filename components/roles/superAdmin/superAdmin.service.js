
import { ApiError } from "../../../utils/ApiError.js";
import Hostel from "../../organisation/hostel/hostel.model.js";
import Room from "../../organisation/room/room.model.js";
import Bed from "../../organisation/bed/bed.model.js";
import User from "../../user/user.model.js";
import mongoose from "mongoose";

const superAdminService = {
    getDashboard: async (data) => {
        const { user: loggedInUser } = data;

        if (!loggedInUser) throw new ApiError(404, "User not found");

        const orgId = new mongoose.Types.ObjectId(
            loggedInUser.organisationId
        );

        


        const [kpiStats, hostelStats,issueStats] = await Promise.all([
            Bed.aggregate([
                {
                    $lookup: {
                        from: Room.collection.name,
                        localField: "roomId",
                        foreignField: "_id",
                        as: "room",
                    },
                },
                { $unwind: "$room" },

                {
                    $match: {
                        "room.organisationId": orgId,
                    },
                },

                {
                    $group: {
                        _id: null,
                        totalBeds: { $sum: 1 },
                        occupiedBeds: {
                            $sum: {
                                $cond: ["$isOccupied", 1, 0],
                            },
                        },
                    },
                },

                {
                    $project: {
                        _id: 0,
                        totalBeds: 1,
                        occupiedBeds: 1,
                        vacantBeds: {
                            $subtract: ["$totalBeds", "$occupiedBeds"],
                        },
                        occupancyRate: {
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
            ]),

            Hostel.aggregate([
                {
                    $match: {
                        organisationId: orgId,
                    },
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

                {
                    $project: {
                        rooms: 0,
                        beds: 0,
                        __v: 0,
                    },
                },
            ]),
        ]);

        const kpis = kpiStats[0] || {
            totalBeds: 0,
            occupiedBeds: 0,
            vacantBeds: 0,
            occupancyRate: 0,
        };

        const totalHostels = hostelStats.length;


        const hostelOccupancy = hostelStats.map((h) => ({
            name: h.name,
            occupancy: Math.round(h.occupancy),
            occupied: h.occupiedBeds,
            vacant: h.totalBeds - h.occupiedBeds,
        }));


        return {
            kpis: {
                totalHostels,
                totalBeds: kpis.totalBeds,
                occupiedBeds: kpis.occupiedBeds,
                vacantBeds: kpis.vacantBeds,
                occupancyRate: Number(kpis.occupancyRate.toFixed(1)),
            },

            hostels: hostelStats,

            charts: {
                hostelOccupancy,
            },

            meta: {
                generatedAt: new Date(),
            },
        };



    }
};

export default superAdminService;