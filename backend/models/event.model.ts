import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    name: {
        type: String,
        enum: ["IP_CAPTURED_INITIALLY", "IP_CHECK_PERFORMED", "IP_CHANGE_DETECTED", "IP_CHANGE_CLASSIFIED", "IP_CHANGE_WARNING_SHOWN", "FULLSCREEN_ENTERED", "FULLSCREEN_EXITED", "TAB_VISIBILITY_CHANGED", "WINDOW_BLUR", "WINDOW_FOCUS", "TIMER_TICK", "TIMER_COMPLETED", "COPY_DETECTED", "PASTE_DETECTED", "ATTEMPT_COMPLETED"],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    attemptId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Attempt"
    },
    metadata: {
        oldIp: {
            type: String
        },
        baselineISP: {
            type: String
        },
        baselineRegion: {
            type: String
        },
        newIp: {
            type: String
        },
        ipChangeType: {
            type: String,
            enum: ["BENIGN", "SUSPICIOUS"]
        },
        ipChangeCount: {
            type: Number
        }

    }

})

EventSchema.pre('updateOne', function () {
    throw new Error('Events are immutable and cannot be updated');
});

EventSchema.pre('updateMany', function () {
    throw new Error('Events are immutable and cannot be updated');
});

EventSchema.pre('findOneAndUpdate', function () {
    throw new Error('Events are immutable and cannot be updated');
});

EventSchema.pre('deleteOne', function () {
    throw new Error('Events are immutable and cannot be deleted');
});

EventSchema.pre('deleteMany', function () {
    throw new Error('Events are immutable and cannot be deleted');
});

EventSchema.pre('findOneAndDelete', function () {
    throw new Error('Events are immutable and cannot be deleted');
});

export default mongoose.model("Event", EventSchema);
