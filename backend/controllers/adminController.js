import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import District from "../models/District.js";
export const createAdmin = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phoneNumber,
            districtId,
        } = req.body;

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const admin = await Admin.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            districtId,
        });

        res.status(201).json(admin);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const createDistrict = async (req, res) => {
    try {
        const district = await District.create(req.body);

        res.status(201).json(district);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};