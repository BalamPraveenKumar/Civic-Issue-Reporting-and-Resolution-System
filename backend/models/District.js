// models/District.js

import mongoose from "mongoose";

const districtSchema = new mongoose.Schema(
    {
        districtId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        districtName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("District", districtSchema);