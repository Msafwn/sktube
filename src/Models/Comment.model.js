import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        parentComment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Performance & Query Optimization Indexes
commentSchema.index({ video: 1, createdAt: -1 }); // Fetching video comments sorted by newest
commentSchema.index({ owner: 1 }); // User comments
commentSchema.index({ parentComment: 1 }); // Comment replies

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
