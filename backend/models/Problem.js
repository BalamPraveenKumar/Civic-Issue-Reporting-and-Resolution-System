// models/Problem.js

import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        districtId: {
            type: String,
            ref: "District",
            required: true,
        },

        media: [
            {
                type: {
                    type: String,
                    enum: ["image", "video"],
                },

                path: {
                    type: String,
                },
            },
        ],

        status: {
            type: String,
            enum: [
                "Pending",
                "In Progress",
                "Resolved",
                "Rejected",
            ],
            default: "Pending",
        },

        remarks: {
            type: String,
            default: "",
        },

        upvotes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Problem", problemSchema);