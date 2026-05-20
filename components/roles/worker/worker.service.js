
import { ApiError } from "../../../utils/ApiError.js";
import Organisation from "../../organisation/organisation.model.js";
import User from "../../user/user.model.js";
import Worker from "./worker.model.js";


const workerService = {
    createWorker: async (data) => {
        const session = await User.startSession();
        try {
            session.startTransaction();
            const {
                userId,
                organisationId,
                workerFullName,
                workerUserName,
                workerPassword,
                workerMobileNumber,
                department
            } = data;
            if (
                [userId, organisationId, department, workerFullName, workerUserName, workerPassword, workerMobileNumber].some(
                    (field) => !field || field.trim() === ""
                )
            ) {
                throw new ApiError(400, "Insufficient credentials");
            }

            const [user, existingWorker, organisation] = await Promise.all([
                User.findById(userId).select("role"),
                User.findOne({
                    $or: [
                        { userName: workerUserName },
                        { mobileNumber: workerMobileNumber }
                    ]
                }),
                Organisation.findById(organisationId)
            ]);

            if (!user) throw new ApiError(404, "User not found");
            if (user.role !== "superadmin" && user.role !== "warden") {
                throw new ApiError(403, "Only superadmins/wardens can create workers");
            }

            if (existingWorker) {
                throw new ApiError(400, "Worker already exists");
            }

            if (!organisation) throw new ApiError(404, "Organisation not found");


            const workerUserPayload = {
                fullName: workerFullName,
                userName: workerUserName,
                password: workerPassword,
                mobileNumber: workerMobileNumber,
                organisationId: organisationId,
                role: "worker",
            };

            const workerUser = await User.create(
                [
                    workerUserPayload
                ],
            );

            const workerPayload = {
                userId: workerUser[0]._id,
                organisationId: organisationId,
                department: department
            };

            const worker = await Worker.create(
                [
                    workerPayload
                ],
            );
            return { ...user.toObject(), workerId: worker[0]._id, workerUserId: workerUser[0]._id, workerUserName: workerUser[0].userName, workerMobileNumber: workerUser[0].mobileNumber };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            if (error.code === 11000) {
                throw new ApiError(400, "Duplicate field value");
            }
            throw new ApiError(500, "Error occurred while creating worker");
        }

    }
};

export default workerService;