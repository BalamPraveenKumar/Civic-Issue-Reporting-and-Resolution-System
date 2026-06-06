import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Step 1: Citizen Login Credentials Verification
export const userLogin = async (req, res) => {
    try {
        const { aadhaarNumber, phoneNumber } = req.body;

        const user = await User.findOne({
            aadhaarNumber,
            phoneNumber
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Aadhaar or Phone Number"
            });
        }

        res.status(200).json({
            success: true,
            message: "User Found",
            userId: user._id,
            phoneNumber: user.phoneNumber
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Step 2: Generate JWT token after successful Firebase OTP verification
export const userTokenGenerate = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Generate JWT with custom payload
        const token = jwt.sign(
            {
                userId: user._id,
                districtId: user.districtId,
                role: "user"
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: "user"
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};