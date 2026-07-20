import { Types } from "mongoose";

export interface IUserProfileResponse {
    _id: string | Types.ObjectId;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    gender: number;
    provider: number;
    confirmEmail?: Date;
    createdAt: Date;
    updatedAt: Date;
    isEmailConfirmed: boolean;
    fullName: string;
}