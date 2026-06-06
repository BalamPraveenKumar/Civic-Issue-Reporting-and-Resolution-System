import express from "express";
import { adminLogin, adminTokenGenerate, userLogin, userTokenGenerate } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/admin/login
router.post("/admin/login", adminLogin);

// POST /api/auth/admin/token
router.post("/admin/token", adminTokenGenerate);

// POST /api/auth/user/login
router.post("/user/login", userLogin);

// POST /api/auth/user/token
router.post("/user/token", userTokenGenerate);

export default router;
