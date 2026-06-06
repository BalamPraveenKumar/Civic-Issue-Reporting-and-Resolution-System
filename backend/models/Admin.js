// models/Admin.js

import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },

        districtId: {
            type: String,
            ref: "District",
            required: true,
        },

        role: {
            type: String,
            default: "admin",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Admin", adminSchema);