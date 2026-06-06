import express from "express";

import {
    createDistrict,
    createAdmin,
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/district", authMiddleware, adminMiddleware, createDistrict);
router.post("/create-admin", authMiddleware, adminMiddleware, createAdmin);

export default router;