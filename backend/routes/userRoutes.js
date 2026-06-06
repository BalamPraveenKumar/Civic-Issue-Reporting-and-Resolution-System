import express from "express";
import { createUser, userLogin, userTokenGenerate } from "../controllers/userController.js";

const router = express.Router();

router.post("/create-user", createUser);
router.post("/login", userLogin);
router.post("/token", userTokenGenerate);

export default router;