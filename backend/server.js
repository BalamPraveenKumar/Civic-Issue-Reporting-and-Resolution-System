import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";


dotenv.config();



connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/problems", problemRoutes);
app.get("/test", (req, res) => {
    res.send("Server Working");
});

app.get("/", (req, res) => {
    res.send("Server Running...");
});

app.listen(process.env.PORT || 5000, () => {
    console.log("Server Started");
});