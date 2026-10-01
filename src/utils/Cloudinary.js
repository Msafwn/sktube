import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

/**
 * Helper to ensure Cloudinary configuration is initialized with credentials
 */
const configureCloudinary = () => {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "ugl1fqix", 
    api_key: process.env.CLOUDINARY_API_KEY || "564662197965533", 
    api_secret: process.env.CLOUDINARY_API_SECRET || "B2KHFE67KZG_gn9fzdS0OcPF7io"
  });
};

/**
 * Helper: Upload large files in 20MB high-speed chunks with eager_async for instant completion
 */
const uploadLargeChunked = (filePath, targetType, retries = 2) => {
  return new Promise((resolve, reject) => {
    const attempt = (remainingRetries) => {
      cloudinary.uploader.upload_large(
        filePath,
        {
          resource_type: targetType,
          chunk_size: 20000000, // 20MB high-throughput chunks (fastest upload speed)
          eager_async: true,    // Asynchronous cloud transcoding: returns instantly without waiting
          timeout: 300000
        },
        (error, result) => {
          if (error) {
            if (remainingRetries > 0) {
              console.warn(`⚠️ High-speed chunk retry (${remainingRetries} left)... Reason:`, error?.message || error);
              setTimeout(() => attempt(remainingRetries - 1), 1500);
            } else {
              reject(error);
            }
          } else {
            resolve(result);
          }
        }
      );
    };
    attempt(retries);
  });
};

/**
 * Uploads a local file to Cloudinary and cleans up the temporary file from the local server.
 * Supports direct fast upload for images and high-speed chunked streaming for videos.
 * 
 * @param {string} localFilePath - Path of the file saved temporarily by multer on disk.
 * @param {string} resourceType - "auto" | "video" | "image" | "raw"
 * @returns {object|null} - Cloudinary upload response object on success, or null on failure.
 */
const uploadOnCloudinary = async (localFilePath, resourceType = "auto") => {
  try {
    if (!localFilePath) return null;

    // Ensure Cloudinary is configured
    configureCloudinary();

    const resolvedPath = path.resolve(localFilePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ Local file not found at path: ${resolvedPath}`);
      return null;
    }

    let stats = null;
    try {
      stats = fs.statSync(resolvedPath);
    } catch (e) {
      // ignore
    }

    const fileSizeInMB = stats ? stats.size / (1024 * 1024) : 0;
    const isVideo = resourceType === "video" || resolvedPath.match(/\.(mp4|mkv|mov|avi|webm|flv)$/i);
    const targetType = isVideo ? "video" : (resourceType === "auto" ? "auto" : "image");

    console.log(`⚡ Fast-Stream Uploading to Cloudinary [Type: ${targetType}, Size: ${fileSizeInMB.toFixed(2)}MB, Path: ${resolvedPath}]...`);

    let response = null;

    if (isVideo) {
      if (fileSizeInMB <= 25) {
        // Fast direct stream for small to medium videos (under 25MB)
        response = await cloudinary.uploader.upload(resolvedPath, {
          resource_type: "video",
          eager_async: true,
          timeout: 300000
        });
      } else {
        // High-throughput 20MB chunked streaming for larger videos
        response = await uploadLargeChunked(resolvedPath, "video");
      }
    } else {
      // Direct high-speed upload for images
      response = await cloudinary.uploader.upload(resolvedPath, {
        resource_type: targetType,
        timeout: 120000
      });
    }

    console.log(`✅ Cloudinary fast upload success for ${targetType}:`, response?.secure_url || response?.url);

    // Upload kamyab hone ke baad local temp file delete karein
    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
      console.log(`🗑️ Successfully deleted local temp file: ${resolvedPath}`);
    }

    return response;

  } catch (error) {
    console.error("❌ Cloudinary upload error:", error?.message || error);
    if (error?.http_code) {
      console.error("HTTP Code:", error.http_code);
    }

    // Upload fail hone par bhi local file delete karein
    const resolvedPath = localFilePath ? path.resolve(localFilePath) : null;
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      try {
        fs.unlinkSync(resolvedPath);
        console.log(`🗑️ Cleaned up local temp file after failed upload: ${resolvedPath}`);
      } catch (unlinkError) {
        console.error("Error deleting local file:", unlinkError);
      }
    }

    return null;
  }
};

/**
 * Cloudinary se purani file/image/video ko delete karne ka helper function
 * 
 * @param {string} cloudinaryUrlOrPublicId - Cloudinary URL ya direct Public ID
 * @param {string} resourceType - "image" (default) ya "video"
 * @returns {object|null} - Cloudinary destroy response
 */
const deleteFromCloudinary = async (cloudinaryUrlOrPublicId, resourceType = "image") => {
  try {
    if (!cloudinaryUrlOrPublicId || typeof cloudinaryUrlOrPublicId !== "string") return null;

    configureCloudinary();

    let publicId = cloudinaryUrlOrPublicId;

    // Agar full HTTP URL hai to upload/ ke baad ka path aur version strip karein
    if (cloudinaryUrlOrPublicId.startsWith("http://") || cloudinaryUrlOrPublicId.startsWith("https://")) {
      // Cloudinary URL structure: .../upload/(v12345678/)?(folder/subfolder/fileName.ext)
      const match = cloudinaryUrlOrPublicId.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
      if (match && match[1]) {
        publicId = match[1];
      } else {
        const urlParts = cloudinaryUrlOrPublicId.split("/");
        const fileName = urlParts[urlParts.length - 1];
        publicId = fileName.split(".")[0];
      }
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });

    console.log(`🗑️ Deleted file from Cloudinary [type: ${resourceType}, public_id: ${publicId}]:`, result);
    return result;

  } catch (error) {
    console.error("❌ Error deleting file from Cloudinary:", error?.message || error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
