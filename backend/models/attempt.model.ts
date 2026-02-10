import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema({
    id: ObjectId,
    ipAddress: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    baselineISP: {
        type: String,
    },
    baselineRegion: {
        type: String,
    },
    ipChangeCount: {
        type: Number,
        default: 0
    },
    lastKnownIp: {
        type: String,
    }
})


export default mongoose.model("Attempt", AttemptSchema);