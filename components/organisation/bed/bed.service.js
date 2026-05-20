import { ApiError } from "../../../utils/ApiError.js";
import User from "../../user/user.model.js";
import Room from "../room/room.model.js";
import Bed from "./bed.model.js";

const bedService = {
    createBed: async (data) => {
        const { user:loggedInUser, roomId, bedNumber } = data;
        if(!loggedInUser){
                    throw new ApiError(403, "Unauthorised");
                }
        if (
            [ roomId, bedNumber].some(
                (field) => !field || field.trim() === ""
            )
        ) {
            throw new ApiError(400, "Insufficient credentials");
        }

        const [room, existingBed,allBedsInRoom] = await Promise.all([
            Room.findById(roomId).select("capacity"),
            Bed.findOne({ roomId, bedNumber }),
            Bed.countDocuments({roomId})
        ]);

        if (loggedInUser?.role !== "superadmin" && loggedInUser?.role !== "warden") {
            throw new ApiError(403, "Only superadmins and wardens can create beds");
        }
        if (!room) throw new ApiError(404, "Room not found");
        if (room.capacity == allBedsInRoom) throw new ApiError(404, "Room Full");
        if (existingBed) throw new ApiError(400, "Bed already exists");

        const bedPayload = {
            roomId: roomId,
            bedNumber: bedNumber,
            isOccupied: false,
            occupiedBy: null,
            createdBy: loggedInUser?._id,
        };
        const bed = await Bed.create(
            bedPayload
        );
        if (!bed) {
            throw new ApiError(500, "Bed creation failed");
        }
        return bed;
    },
    assignBed: async (data) => {
        const { userId, bedId, studentUserId } = data;
        if (
            [userId, bedId, studentUserId].some(
                (field) => !field || field.trim() === ""
            )
        ) {
            throw new ApiError(400, "Insufficient credentials");
        }

        const [user, bed,student,existingBedAssignedToStudent] = await Promise.all([
            User.findById(userId).select("role"),
            Bed.findById(bedId),
            User.findById(studentUserId).select("role"),
            Bed.findOne({occupiedBy:studentUserId,isOccupied:true})
        ]);

        if (!user) throw new ApiError(404, "User not found");
        if (user.role !== "superadmin" && user.role !== "warden") {
            throw new ApiError(403, "Only superadmins and wardens can assign beds");
        }
        if (!bed) throw new ApiError(404, "Bed not found");
        if (bed.isOccupied) throw new ApiError(400, "Bed is already occupied");
        if(existingBedAssignedToStudent) throw new ApiError(400, "Student is already assigned to a bed.");
        if (!student || student.role != 'student') throw new ApiError(404, "Student not found");


        bed.isOccupied = true;
        bed.occupiedBy = studentUserId;
        bed.statusHistory.push({
            status: "occupied",
            updatedBy: userId,
            occupiedBy:student.userId,
            note: "Bed assigned to student",
            timestamp: new Date(),
        });
        await bed.save();
        return bed;
    },
    unAssignBed: async (data) => {
        const { userId, bedId } = data;
        if (
            [userId, bedId].some(
                (field) => !field || field.trim() === ""
            )
        ) {
            throw new ApiError(400, "Insufficient credentials");
        }

        const [user, bed] = await Promise.all([
            User.findById(userId).select("role"),
            Bed.findById(bedId),
        ]);

        if (!user) throw new ApiError(404, "User not found");
        if (user.role !== "superadmin" && user.role !== "warden") {
            throw new ApiError(403, "Only superadmins and wardens can unassign beds");
        }
        if (!bed) throw new ApiError(404, "Bed not found");
        if (!bed.isOccupied) throw new ApiError(400, "Bed is already vacant");


        bed.isOccupied = false;
        bed.occupiedBy = null;
        bed.statusHistory.push({
            status: "vacant",
            updatedBy: userId,
            occupiedBy:null,
            note: "Bed unassigned from student",
            timestamp: new Date(),
        });
        await bed.save();
        return bed;
    },
    getAllBeds: async (data) => {
        const { user:loggedInUser, roomId, } = data;
        if(!loggedInUser){
                    throw new ApiError(403, "Unauthorised");
                }
        if (
            !roomId
        ) {
            throw new ApiError(400, "Insufficient credentials");
        }

        

        
        const bed = await Bed.find(
            {roomId:roomId}
        );
        return bed;
    },

};

export default bedService;