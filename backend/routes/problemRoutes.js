
import express from "express";

import {
    createProblem,
    getMyIssues,
    getDistrictIssues,
    updateProblemStatus,
    toggleUpvote
} from "../controllers/problemController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";


const router = express.Router();
console.log("Problem Routes Loaded");
router.post(
    "/create",
    authMiddleware,
    upload.array("media", 5),
    createProblem
);

router.get(
    "/my-issues",
    authMiddleware,
    getMyIssues
);

router.get("/test", (req, res) => {
    res.send("Problem Routes Working");
});

router.get(
    "/district-issues",
    authMiddleware,
    getDistrictIssues
);

router.patch(
    "/:id/status",
    authMiddleware,
    adminMiddleware,
    updateProblemStatus
);

router.post(
    "/:id/upvote",
    authMiddleware,
    toggleUpvote
);

export default router;

