import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router = Router();

// Create playlist (Protected)
router.route("/").post(verifyJWT, createPlaylist);

// Playlist operations by ID
router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(verifyJWT, updatePlaylist)
    .delete(verifyJWT, deletePlaylist);

// Add / Remove video from playlist (Protected)
router.route("/add/:videoId/:playlistId").patch(verifyJWT, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyJWT, removeVideoFromPlaylist);

// Get all playlists of a user
router.route("/user/:userId").get(getUserPlaylists);

export default router;
