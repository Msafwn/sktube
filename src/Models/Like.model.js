import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate likes
likeSchema.index({ video: 1, likedBy: 1 });
likeSchema.index({ comment: 1, likedBy: 1 });
likeSchema.index({ tweet: 1, likedBy: 1 });

// Performance & Query Optimization Indexes
likeSchema.index({ likedBy: 1, createdAt: -1 }); // Get liked videos sorted
likeSchema.index({ likedBy: 1, video: 1 }); // Video like check

export const Like = mongoose.model("Like", likeSchema);
