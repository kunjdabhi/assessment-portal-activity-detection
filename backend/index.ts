import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import ipRoute from "./routes/ip.route.js";
import connectDB from "./config/db.js";
import requestIp from "request-ip";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.set("trust proxy", true);
app.use(requestIp.mw());
app.use("/api", ipRoute);

connectDB();

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});