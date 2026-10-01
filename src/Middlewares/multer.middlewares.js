import multer from "multer";
import fs from "fs";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

/**
 * Multer Disk Storage Configuration
 * Files ko temporary taur par local disk (public/temp) par store karta hai
 */
const storage = multer.diskStorage({
    // 1. File store hone ki destination directory
    destination: function (req, file, cb) {
        const tempDir = path.resolve("./public/temp");
        // Agar directory exist nahi karti to create kar lo
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },

    // 2. Upload hone wali file ka safe unique naam generate karna
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}-${safeBase}${ext}`);
    }
});

// Allowed MIME types & extensions whitelist
const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

const ALLOWED_VIDEO_MIMES = [
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "video/x-matroska",
    "video/avi",
    "video/x-msvideo",
    "video/mpeg"
];
const ALLOWED_VIDEO_EXTS = [".mp4", ".mov", ".webm", ".mkv", ".avi", ".mpeg", ".m4v"];

/**
 * Server-Side File MIME & Extension Filter
 * Malicious executables, shell scripts, ya dangerous file uploads ko block karta hai
 */
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    // 1. Video files validation (videoFile field)
    if (file.fieldname === "videoFile") {
        if (!ALLOWED_VIDEO_MIMES.includes(mime) || !ALLOWED_VIDEO_EXTS.includes(ext)) {
            return cb(
                new ApiError(
                    400,
                    `Invalid video format (${ext || mime}). Only standard MP4, MOV, WEBM, MKV, and AVI are permitted.`
                ),
                false
            );
        }
        return cb(null, true);
    }

    // 2. Image files validation (thumbnail, avatar, coverImage)
    if (["thumbnail", "avatar", "coverImage"].includes(file.fieldname)) {
        if (!ALLOWED_IMAGE_MIMES.includes(mime) || !ALLOWED_IMAGE_EXTS.includes(ext)) {
            return cb(
                new ApiError(
                    400,
                    `Invalid image format (${ext || mime}). Only JPG, JPEG, PNG, and WEBP are permitted.`
                ),
                false
            );
        }
        return cb(null, true);
    }

    // 3. Fallback for allowed media types
    if (ALLOWED_IMAGE_MIMES.includes(mime) || ALLOWED_VIDEO_MIMES.includes(mime)) {
        return cb(null, true);
    }

    return cb(
        new ApiError(400, `File type not supported for upload field: ${file.fieldname} (${mime}).`),
        false
    );
};

// Multer upload middleware export
export const upload = multer({ 
    storage, 
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max limit
    }
});