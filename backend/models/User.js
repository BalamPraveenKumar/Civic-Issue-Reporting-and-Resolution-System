// models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        aadhaarNumber: {
            type: String,
            required: true,
            unique: true,
        },

        phoneNumber: {
            type: String,
            required: true,
        },

        districtId: {
            type: String,
            ref: "District",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);