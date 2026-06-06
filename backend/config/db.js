import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
    try {
        // Set Google Public DNS to avoid querySrv resolution failures on certain local networks/routers
        dns.setServers(["8.8.8.8", "8.8.4.4"]);

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database Connection Failed");
        console.error(error.message);
        process.exit(1);
    }
};

export default connectDB;