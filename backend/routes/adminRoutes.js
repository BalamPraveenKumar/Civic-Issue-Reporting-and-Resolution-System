import express from "express";

import {
    createDistrict,
    createAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/district", createDistrict);
router.post("/create-admin", createAdmin);

export default router;