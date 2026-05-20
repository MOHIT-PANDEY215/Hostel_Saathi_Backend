import { ApiError } from "../../utils/ApiError.js";
import jwt from "jsonwebtoken";
import Student from "../roles/student/student.model.js";
import Warden from "../roles/warden/warden.model.js";
import Worker from "../roles/worker/worker.model.js";
import User from "../user/user.model.js";
import Organisation from "../organisation/organisation.model.js";
import SuperAdmin from "../roles/superAdmin/superAdmin.model.js";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found.");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token" + error
        );
    }
};

const patchUserData = async (user) => {
    switch (user.role) {
        case "student":
            const student = await Student.findOne({ userId: user._id });
            user._doc.hostelNumber = student.hostelNumber;
            user._doc.registrationNumber = student.registrationNumber;
            break;

        case "warden":
            const warden = await Warden.findOne({ userId: user._id });
            user._doc.hostelNumber = warden.hostelNumber;
            break;

        case "worker":
            const worker = await Worker.findOne({ userId: user._id });
            user._doc.department = worker.department;
            break;

        case "superadmin":
            break;

        default:
            throw new ApiError(500, "Invalid user role");
    }
    return user;
};
const authService = {
    //login using username and password, 
    login: async (data) => {
        const { userName, password } = data;
        if (
            [userName, password].some(
                (field) => field?.trim() === ""
            )
        ) {
            throw new ApiError(400, "Insufficient credentials");
        }

        const user = await User.findOne({ userName });

        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid credentials");
        }
        delete user._doc.password;
        delete user._doc.refreshToken;
        switch (user.role) {
            case "student":
                // const student = await Student.findOne({ userId: user._id });
                const student = await Student.aggregate([
                    { $match: { userId: user._id } },
                    {
                        $lookup: {
                            from: "hostels",
                            localField: "hostelId",
                            foreignField: "__id",
                            as: "hostelDetails",
                        },
                    },
                    { $unwind: "$hostelDetails" },
                ]);
                user._doc.roleDetails = student;
                break;

            case "warden":
                const warden = await Warden.aggregate([
                    { $match: { userId: user._id } },
                    {
                        $lookup: {
                            from: "hostels",
                            localField: "hostelId",
                            foreignField: "__id",
                            as: "hostelDetails",
                        },
                    },
                    { $unwind: "$hostelDetails" },
                ]);
                user._doc.roleDetails = warden;
                break;

            case "worker":
                const worker = await Worker.findOne({ userId: user._id });
                user._doc.department = worker.department;
                break;

            case "superadmin":
                break;

            default:
                throw new ApiError(500, "Invalid user role");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
        return { user, accessToken, refreshToken };
    },
    signup: async (data) => {

        const {
            fullName,
            userName,
            password,
            mobileNumber,
            role,
            avatar = undefined,
            registrationNumber,
            hostelNumber,
            department
        } = data;

        if (
            [fullName, userName, password, mobileNumber, role].some(
                (field) => !field || field.trim() === ""
            )
        ) {
            throw new ApiError(400, "Insufficient credentials");
        }

        if (role == 'superadmin') {
            throw new ApiError(403, "Cannot create superadmin user");
        }

        let roleModel;
        let roleData = {};

        switch (role) {
            case "student":
                if (!registrationNumber || !hostelNumber) {
                    throw new ApiError(400, "Insufficient credentials");
                }

                roleData = {
                    registrationNumber,
                    hostelNumber: Number(hostelNumber),
                };

                roleModel = Student;
                break;

            case "warden":
                if (!hostelNumber) {
                    throw new ApiError(400, "Insufficient credentials");
                }

                roleData = {
                    hostelNumber: Number(hostelNumber),
                };

                roleModel = Warden;
                break;

            case "worker":
                if (!department) {
                    throw new ApiError(400, "Insufficient credentials");
                }

                roleData = { department };

                roleModel = Worker;
                break;

            case "superadmin":
                roleModel = SuperAdmin;
                break;

            default:
                throw new ApiError(400, "Invalid user role");
        }

        const findQuery = role === "student" ? [{ registrationNumber }, { userName }, { mobileNumber }] : [{ userName }, { mobileNumber }];
        const existedUser = await User.find({
            $or: findQuery,
        });

        if (existedUser.length > 0) {
            throw new ApiError(409, "User/Mobile already exists");
        }

        const user = await User.create({
            fullName,
            userName,
            password,
            mobileNumber,
            role,
            avatar,
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new ApiError(500, "User creation failed");
        }

        const createdRole = await roleModel.create({
            userId: createdUser._id,
            ...roleData,
        });

        await patchUserData(createdUser);

        const { accessToken, refreshToken } =
            await generateAccessAndRefereshTokens(createdUser._id);

        return { createdUser, accessToken, refreshToken };
    },
    initSuperAdmin: async (data) => {
        const session = await mongoose.startSession();
        try {
            let createdUser;
            let organisation;

            await session.withTransaction(async () => {
                const {
                    fullName,
                    userName,
                    password,
                    mobileNumber,
                    avatar,
                    organisationName,
                } = data;

                if (
                    [fullName, userName, password, mobileNumber, organisationName].some(
                        (field) => !field || field.trim() === ""
                    )
                ) {
                    throw new ApiError(400, "Insufficient credentials");
                }

                const existingUser = await User.findOne({
                    $or: [{ userName }, { mobileNumber }],
                }).session(session);

                const existingOrganisation = await Organisation.findOne({
                    name: organisationName.toLowerCase(),
                }).session(session);

                if (existingUser) {
                    throw new ApiError(400, "User already exists");
                }

                if (existingOrganisation) {
                    throw new ApiError(400, "Organisation already exists");
                }

                const superAdminPayload = {
                    fullName,
                    userName,
                    password,
                    mobileNumber,
                    role: "superadmin",
                    avatar,
                };

                const superAdminUser = await new User(superAdminPayload).save({ session });

                const organisationPayload = {
                name: organisationName.toLowerCase(),
                createdBy: superAdminUser._id,
            };

                organisation = await new Organisation(organisationPayload).save({ session });

                const superAdminDBPayload = {
                userId: superAdminUser._id,
                organisations: [
                    {
                        organisationId: organisation._id,
                        role: "superadmin",
                    },
                ],
            };

                await new SuperAdmin(superAdminDBPayload).save({ session });
                superAdminUser.organisationId = organisation._id;
                await superAdminUser.save({session});

                createdUser = superAdminUser;
            });

            session.endSession();

            const { accessToken, refreshToken } =
                await generateAccessAndRefereshTokens(createdUser._id);

            const userData = {
                ...createdUser._doc,
                organisationId: organisation._id,
                organisationName: organisation.name,
                organisations: [
                    {
                        organisationId: organisation._id,
                        role: "superadmin",
                    },
                ],
            };
            delete userData.password
            delete userData.refreshToken

            return { createdUser: userData, accessToken, refreshToken };

        } catch (error) {
            // await session.abortTransaction();
            session.endSession();
            throw new ApiError(500, "Init failed: " + error.message);
        }
    },
    logoutUser: async (id) => {
        await User.findByIdAndUpdate(id, { $unset: { refreshToken: 1 } }, { new: true });
    },
    refreshAccessToken: async (req) => {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }
        let decodedToken;

        try {
            decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );
        } catch (err) {
            console.log(err, "error in verifying refresh token");
            throw new ApiError(401, "Invalid or expired refresh token");
        }
        const user = await User.findById(decodedToken?._id);


        if (!user || incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    },
    changeCurrentPassword: async (data) => {
        const { oldPassword, newPassword } = data;
        if (!oldPassword || !newPassword) {
            throw new ApiError(400, "Both old and new passwords are required");
        }

        const user = await User.findById(data._id);

        if (!user || !(await user.isPasswordCorrect(oldPassword))) {
            throw new ApiError(400, "Invalid old password");
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });
        return user;
    },
};

export default authService;