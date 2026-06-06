import Problem from "../models/Problem.js";
import User from "../models/User.js";

export const createProblem = async (req, res) => {
    try {

        const {
            title,
            description,
            category
        } = req.body;
        console.log("JWT Payload:", req.user);
        const user = await User.findById(
            req.user.userId
        );
        console.log(user);

        const media = req.files.map(file => ({
            type: file.mimetype.startsWith("image")
                ? "image"
                : "video",

            path: file.path
        }));

        const problem = await Problem.create({
            title,
            description,
            category,
            districtId: user.districtId,
            userId: user._id,
            media
        });

        res.status(201).json({
            success: true,
            problem
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



export const getMyIssues = async (req, res) => {
    try {

        const issues = await Problem.find({
            userId: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            issues
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getDistrictIssues = async (
    req,
    res
) => {
    try {

        const issues = await Problem.find({
            districtId: req.user.districtId
        })
            .populate(
                "userId",
                "name phoneNumber"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: issues.length,
            issues
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProblemStatus = async (
    req,
    res
) => {
    try {

        const { status, remarks } = req.body;

        const validStatuses = [
            "Pending",
            "In Progress",
            "Resolved",
            "Rejected"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Status"
            });
        }

        const problem = await Problem.findById(
            req.params.id
        );

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        problem.status = status;
        problem.remarks = remarks;

        await problem.save();

        res.status(200).json({
            success: true,
            message: "Status updated successfully",
            problem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};