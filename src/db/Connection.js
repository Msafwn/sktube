import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

/**
 * MongoDB database connection with robust TLS and connection pooling options
 */
const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: DB_Name,
            family: 4, // Force IPv4 to prevent IPv6 TLS handshake timeouts
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 15000,
            heartbeatFrequencyMS: 10000,
        });

        console.log(`✅ MongoDB connected successfully! DB Name: ${DB_Name} | Host: ${connection.connection.host}`);
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;