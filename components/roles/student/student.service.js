import { ApiError } from "../../../utils/ApiError.js";
import Hostel from "../../organisation/hostel/hostel.model.js";
import Organisation from "../../organisation/organisation.model.js";
import User from "../../user/user.model.js";
import Student from "./student.model.js";


const studentService = {
    createStudent: async (data) => {
        const session = await User.startSession();
        try {
            session.startTransaction();
            const {
                userId,
                organisationId,
                hostelId,
                roomId,
                bedId,
                studentFullName,
                studentUserName,
                studentPassword,
                studentMobileNumber,
                department
            } = data;
            if (
                [userId, organisationId, hostelId,department, studentFullName, studentUserName, studentPassword, studentMobileNumber].some(
                    (field) => !field || field.trim() === ""
                )
            ) {
                throw new ApiError(400, "Insufficient credentials");
            }

            const [user, existingStudent, organisation, hostel] = await Promise.all([
                User.findById(userId).select("role"),
                User.findOne({
                    $or: [
                        { userName: studentUserName },
                        { mobileNumber: studentMobileNumber }
                    ]
                }),
                Organisation.findById(organisationId),
                Hostel.findById(hostelId),
            ]);

            if (!user) throw new ApiError(404, "User not found");
            if (user.role !== "superadmin" && user.role !== "warden") {
                throw new ApiError(403, "Only superadmins/wardens can create workers");
            }

            if (existingStudent) {
                throw new ApiError(400, "Student already exists");
            }

            if (!organisation) throw new ApiError(404, "Organisation not found");
            if (!hostel) throw new ApiError(404, "Hostel not found");


            const studentUserPayload = {
                fullName: studentFullName,
                userName: studentUserName,
                password: studentPassword,
                mobileNumber: studentMobileNumber,
                organisationId: organisationId,
                hostelId: hostelId,
                role: "student",
            };

            const studentUser = await User.create(
                [
                    studentUserPayload
                ],
            );

            const registraionNumber = `${Date.now().getFullYear()}${Math.floor(10000 + Math.random() * 90000)}`; // 202412345 

            const studentPayload = {
                userId: studentUser[0]._id,
                organisationId: organisationId,
                hostelId: hostelId,
                registraionNumber,
                roomId: null,
                bedId: null,
            };

            const student = await Student.create(
                [
                    studentPayload
                ],
            );
            return { ...user.toObject(), studentId: student[0]._id, studentUserId: studentUser[0]._id, studentUserName: studentUser[0].userName, studentMobileNumber: studentUser[0].mobileNumber };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            if (error.code === 11000) {
                throw new ApiError(400, "Duplicate field value");
            }
            throw new ApiError(500, "Error occurred while creating student");
        }

    }
};

export default studentService;