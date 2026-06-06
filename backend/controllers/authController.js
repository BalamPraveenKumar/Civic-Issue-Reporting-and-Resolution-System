import Admin from "../models/Admin.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Step 1: Admin Login Credentials Verification
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Password"
            });
        }

        res.status(200).json({
            message: "Credentials Verified",
            phoneNumber: admin.phoneNumber
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Step 2: Generate JWT token after successful Firebase OTP verification (Admin)
export const adminTokenGenerate = async (req, res) => {
    try {
        const { email } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Generate JWT with custom payload
        const token = jwt.sign(
            {
                adminId: admin._id,
                districtId: admin.districtId,
                role: "admin"
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: "admin"
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Step 1: Citizen Login Credentials Verification (authRoutes version)
export const userLogin = async (req, res) => {
    try {
        const { aadhaarNumber, phoneNumber } = req.body;

        const user = await User.findOne({
            aadhaarNumber,
            phoneNumber
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid Credentials"
            });
        }

        res.status(200).json({
            message: "Credentials Verified",
            phoneNumber: user.phoneNumber
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Step 2: Generate JWT token after successful Firebase OTP verification (User/Citizen)
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
                aadhaarNumber: user.aadhaarNumber,
                districtId: user.districtId,
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