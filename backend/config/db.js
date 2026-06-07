import mongoose from "mongoose";
import dns from "dns";
import District from "../models/District.js";

const connectDB = async () => {
    try {
        // Set Google Public DNS to avoid querySrv resolution failures on certain local networks/routers
        dns.setServers(["8.8.8.8", "8.8.4.4"]);

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Seed/Upsert the 26 districts
        const requiredDistricts = [
            { districtId: "ASR001", districtName: "Alluri Sitharama Raju" },
            { districtId: "AKP001", districtName: "Anakapalli" },
            { districtId: "ATP001", districtName: "Anantapuramu" },
            { districtId: "ANM001", districtName: "Annamayya" },
            { districtId: "BPT001", districtName: "Bapatla" },
            { districtId: "CTR001", districtName: "Chittoor" },
            { districtId: "KSM001", districtName: "Dr. B. R. Ambedkar Konaseema" },
            { districtId: "EG001", districtName: "East Godavari" },
            { districtId: "ELR001", districtName: "Eluru" },
            { districtId: "GNT001", districtName: "Guntur" },
            { districtId: "KKD001", districtName: "Kakinada" },
            { districtId: "KRS001", districtName: "Krishna" },
            { districtId: "KNL001", districtName: "Kurnool" },
            { districtId: "NDL001", districtName: "Nandyal" },
            { districtId: "NTR001", districtName: "NTR" },
            { districtId: "PLD001", districtName: "Palnadu" },
            { districtId: "PMY001", districtName: "Parvathipuram Manyam" },
            { districtId: "PKM001", districtName: "Prakasam" },
            { districtId: "NLP001", districtName: "Sri Potti Sriramulu Nellore" },
            { districtId: "SSS001", districtName: "Sri Sathya Sai" },
            { districtId: "SKM001", districtName: "Srikakulam" },
            { districtId: "TPT001", districtName: "Tirupati" },
            { districtId: "VSP001", districtName: "Visakhapatnam" },
            { districtId: "VZM001", districtName: "Vizianagaram" },
            { districtId: "WG001", districtName: "West Godavari" },
            { districtId: "YSR001", districtName: "YSR Kadapa" }
        ];

        for (const dist of requiredDistricts) {
            await District.findOneAndUpdate(
                { districtId: dist.districtId },
                { districtName: dist.districtName },
                { upsert: true, new: true }
            );
        }
        console.log("Districts seed database updated successfully");
    } catch (error) {
        console.error("Database Connection Failed");
        console.error(error.message);
        process.exit(1);
    }
};

export default connectDB;