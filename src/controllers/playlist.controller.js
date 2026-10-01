// Mongoose aur ObjectId validation import
import mongoose, { isValidObjectId } from "mongoose";

// Playlist model import
import { Playlist } from "../Models/Playlist.model.js";

// Video model import
import { Video } from "../Models/Video.model.js";

// Error handling class
import { ApiError } from "../utils/ApiError.js";

// Standard JSON response utility
import { ApiResponse } from "../utils/ApiResponse.js";

// Async error handler wrapper
import { asyncHandler } from "../utils/AsyncHandle.js";

/**
 * =========================================================================
 * Controller 1: Create Playlist (Nayi Video Playlist Banana)
 * Kaam: Name aur description le kar nayi empty playlist create karna
 * Method: POST | Route: /api/v1/playlist | Middleware: verifyJWT
 * =========================================================================
 */
const createPlaylist = asyncHandler(async (req, res) => {
    // 1. Request body se name aur description extract kiye
    const { name, description } = req.body || {};

    // 2. Validate name
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required.");
    }

    // 3. Validate description
    if (!description || description.trim() === "") {
        throw new ApiError(400, "Playlist description is required.");
    }

    // 4. Database mein Playlist create ki
    const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        videos: [], // Shuru mein videos list empty hogi
        owner: req.user._id // Logged in user iska owner hoga
    });

    // 5. Agar create na ho sake to error throw karein
    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist. Please try again.");
    }

    // 6. 201 Created status ke sath client ko return karein
    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

/**
 * =========================================================================
 * Controller 2: Get User Playlists (User Ki Saari Playlists Lana)
 * Kaam: Specific user ki banayi hui playlists aur unke owner ka data lana
 * Method: GET | Route: /api/v1/playlist/user/:userId
 * =========================================================================
 */
const getUserPlaylists = asyncHandler(async (req, res) => {
    // 1. URL params se userId li
    const { userId } = req.params;

    // 2. Validate userId format
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID format");
    }

    // 3. Database se user ki playlists find ki aur owner info populate ki (using lean & sorting by newest)
    const playlists = await Playlist.find({ owner: userId })
        .populate("owner", "fullName username avatar")
        .sort({ createdAt: -1 })
        .lean();

    // 4. 200 response return kiya
    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
});

/**
 * =========================================================================
 * Controller 3: Get Playlist By ID (Single Playlist + Usme Shamil Videos Lana)
 * Kaam: Playlist ki details + uske andar dali gayi saari published videos aur unke creators fetch karna
 * Method: GET | Route: /api/v1/playlist/:playlistId
 * =========================================================================
 */
const getPlaylistById = asyncHandler(async (req, res) => {
    // 1. URL params se playlistId nikaali
    const { playlistId } = req.params;

    // 2. Validate format
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID format");
    }

    // 3. Aggregation chala kar playlist + videos + creators info nikali
    const playlist = await Playlist.aggregate([
        // Stage 1: Specific playlist match karein
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        // Stage 2: Videos collection se is playlist ki videos lookup karein
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    // Sirf published videos include karein
                    {
                        $match: {
                            isPublished: true
                        }
                    },
                    // Har video ke creator/owner ki details lookup karein
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    },
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            title: 1,
                            description: 1,
                            duration: 1,
                            views: 1,
                            owner: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        // Stage 3: Playlist ke owner ki details lookup karein
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        // Stage 4: Owner object flatten aur totalVideos count calculate karein
        {
            $addFields: {
                owner: { $first: "$owner" },
                totalVideos: { $size: "$videos" }
            }
        }
    ]);

    // 4. Agar playlist na mile to 404
    if (!playlist?.length) {
        throw new ApiError(404, "Playlist not found");
    }

    // 5. Return playlist
    return res
        .status(200)
        .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

/**
 * =========================================================================
 * Controller 4: Add Video To Playlist (Playlist Mein Video Add Karna)
 * Kaam: Check karna ke user owner hai aur video pehle se playlist me mojood na ho, fir push karna
 * Method: PATCH | Route: /api/v1/playlist/add/:videoId/:playlistId | Middleware: verifyJWT
 * =========================================================================
 */
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // 1. URL params se playlistId aur videoId nikaali
    const { playlistId, videoId } = req.params;

    // 2. Validate IDs
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist ID or Video ID format");
    }

    // 3. Find playlist & check ownership (lightweight lean projection)
    const existingPlaylist = await Playlist.findById(playlistId).select("owner").lean();
    if (!existingPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    // 4. Security check: Kya logged in user is playlist ka owner hai?
    if (existingPlaylist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to modify this playlist.");
    }

    // 5. Video existence check (lightweight select & lean)
    const video = await Video.findById(videoId).select("_id").lean();
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 6. Atomic addition using $addToSet (automatically avoids duplicates)
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: new mongoose.Types.ObjectId(videoId) } },
        { new: true }
    ).lean();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));
});

/**
 * =========================================================================
 * Controller 5: Remove Video From Playlist (Playlist Se Video Remove Karna)
 * Kaam: Playlist se specific video ID nikaalna
 * Method: PATCH | Route: /api/v1/playlist/remove/:videoId/:playlistId | Middleware: verifyJWT
 * =========================================================================
 */
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // 1. URL params se IDs li
    const { playlistId, videoId } = req.params;

    // 2. Validate IDs
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist ID or Video ID format");
    }

    // 3. Find playlist & check ownership (lightweight lean projection)
    const existingPlaylist = await Playlist.findById(playlistId).select("owner").lean();
    if (!existingPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    // 4. Owner verification
    if (existingPlaylist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to modify this playlist");
    }

    // 5. Atomic removal using $pull & lean()
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: new mongoose.Types.ObjectId(videoId) } },
        { new: true }
    ).lean();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));
});

/**
 * =========================================================================
 * Controller 6: Delete Playlist (Poori Playlist Delete Karna)
 * Kaam: Playlist document ko database se delete karna
 * Method: DELETE | Route: /api/v1/playlist/:playlistId | Middleware: verifyJWT
 * =========================================================================
 */
const deletePlaylist = asyncHandler(async (req, res) => {
    // 1. Playlist ID li
    const { playlistId } = req.params;

    // 2. Validate format
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID format");
    }

    // 3. Find playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // 4. Security check
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this playlist");
    }

    // 5. Delete document
    await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

/**
 * =========================================================================
 * Controller 7: Update Playlist (Playlist Ka Name Ya Description Update Karna)
 * Kaam: Playlist ka title aur description modify karna
 * Method: PATCH | Route: /api/v1/playlist/:playlistId | Middleware: verifyJWT
 * =========================================================================
 */
const updatePlaylist = asyncHandler(async (req, res) => {
    // 1. Params aur body li
    const { playlistId } = req.params;
    const { name, description } = req.body || {};

    // 2. Validate ID
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID format");
    }

    // 3. Validate name and description
    if (!name || !description) {
        throw new ApiError(400, "Both name and description are required");
    }

    // 4. Find playlist & check ownership (lightweight lean projection)
    const existingPlaylist = await Playlist.findById(playlistId).select("owner").lean();
    if (!existingPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    // 5. Security check
    if (existingPlaylist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this playlist");
    }

    // 6. Update fields using atomic $set & lean()
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name.trim(),
                description: description.trim()
            }
        },
        { new: true }
    ).lean();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
});

// Controllers export kiye
export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
