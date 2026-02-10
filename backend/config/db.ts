import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        await mongoose.connect(mongoUri, {
            tls: true,
            tlsAllowInvalidCertificates: false,
            serverSelectionTimeoutMS: 5000,
        });

        console.log(" MongoDB connected successfully");
    } catch (error) {
        console.error(" MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;
