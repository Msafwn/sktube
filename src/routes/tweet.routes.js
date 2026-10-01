import { Router } from "express";
import {
    getAllTweets,
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";
import { verifyJWT, verifyOptionalJWT } from "../Middlewares/auth.middleware.js";

const router = Router();

// Get all tweets (Public + Optional Auth for isLiked calculation) / Create tweet (Protected)
router
    .route("/")
    .get(verifyOptionalJWT, getAllTweets)
    .post(verifyJWT, createTweet);

// Get User Tweets (Public + Optional Auth)
router.route("/user/:userId").get(verifyOptionalJWT, getUserTweets);

// Update & Delete Tweet (Protected)
router
    .route("/:tweetId")
    .patch(verifyJWT, updateTweet)
    .delete(verifyJWT, deleteTweet);

export default router;
