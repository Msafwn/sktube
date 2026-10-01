import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Performance & Query Optimization Indexes
tweetSchema.index({ owner: 1, createdAt: -1 }); // User tweets
tweetSchema.index({ createdAt: -1 }); // Global community tweets feed

export const Tweet = mongoose.model("Tweet", tweetSchema);
