const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);

        console.log("✅ Database Connected...");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1); // Exit process if DB fails to connect
    }
};

module.exports = connectDB;
