import { type HydratedDocument, type InferSchemaType, Schema } from "mongoose";

export const userSchema = new Schema(
    {
        username: { type: String, required: true },
    },
    {
        timestamps: true,
    },
);

export type UserSchema = InferSchemaType<typeof userSchema>;
export type HydratedUserDocument = HydratedDocument<UserSchema>;