import mongoose, { Schema } from "mongoose";


const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
    {
        timestamps: true
    }
);

// Prevent duplicate subscriptions
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

// Performance & Query Optimization Indexes
subscriptionSchema.index({ channel: 1, createdAt: -1 }); // Channel subscriber list & count
subscriptionSchema.index({ subscriber: 1, createdAt: -1 }); // User subscribed channels feed

export const Subscription = mongoose.model("Subscription", subscriptionSchema);