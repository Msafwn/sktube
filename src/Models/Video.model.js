import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Video Schema Definition
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Cloudinary video URL
            required: true
        },
        thumbnail: {
            type: String, // Cloudinary thumbnail image URL
            required: true
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {
            type: Number, // Cloudinary se aane wala video duration (in seconds)
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        viewedBy: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User" // User model se relation (foreign key)
        }
    }, 
    {
        timestamps: true
    }
);

// Performance & Query Optimization Indexes
videoSchema.index({ isPublished: 1, createdAt: -1 }); // Home feed & published video listings
videoSchema.index({ owner: 1, createdAt: -1 }); // Creator channel videos & dashboard
videoSchema.index({ views: -1 }); // Popular/Trending video sorting
videoSchema.index({ title: "text", description: "text" }); // Fast full-text search

// Advanced MongoDB aggregation pipeline pagination plugin enable karein
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);