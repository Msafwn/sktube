import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// User Schema Definition
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true // Fast searching/indexing ke liye
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // Cloudinary image URL
            required: true,
        },
        coverImage: {
            type: String, // Cloudinary image URL (optional)
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: function () {
                return !this.googleId;
            }
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },
        refreshToken: {
            type: String
        },
        failedLoginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true // Automatically createdAt aur updatedAt fields add karega
    }
);

// Performance & Query Optimization Indexes (email is already indexed via unique: true)
userSchema.index({ createdAt: -1 });

/**
 * Mongoose Pre-save Hook:
 * User document save hone se theek pehle password ko hash karein
 * Agar password modify nahi hua to dobara hash nahi karega
 */
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;

    this.password = await bcrypt.hash(this.password, 10);
});

/**
 * Custom Method: User ka entered plain password aur database ka hashed password compare karein
 */
userSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
};

/**
 * Custom Method: Short-lived Access Token generate karein
 */
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

/**
 * Custom Method: Long-lived Refresh Token generate karein
 */
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);