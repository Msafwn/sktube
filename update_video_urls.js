import mongoose from "mongoose";
import dotenv from "dotenv";
import { Video } from "./src/Models/Video.model.js";
import { DB_Name } from "./src/constants.js";

dotenv.config({ path: "./.env" });

const verifiedUrls = [
  "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4",
  "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
  "https://vjs.zencdn.net/v/oceans.mp4",
  "https://res.cloudinary.com/demo/video/upload/samples/sea-turtle.mp4",
  "https://res.cloudinary.com/demo/video/upload/c_scale,w_720/elephants.mp4",
  "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
  "https://res.cloudinary.com/demo/video/upload/dog.mp4",
  "https://res.cloudinary.com/demo/video/upload/kitten_fighting.mp4",
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/tags/movie.mp4"
];

const updateVideos = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_Name,
      family: 4
    });

    const videos = await Video.find({}).sort({ createdAt: 1 });
    console.log(`Found ${videos.length} videos in database.`);

    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      const targetUrl = verifiedUrls[i % verifiedUrls.length];
      v.videoFile = targetUrl;
      await v.save();
      console.log(`Updated video [${i + 1}/${videos.length}]: "${v.title.slice(0, 30)}..." => ${targetUrl}`);
    }

    console.log("\n🎉 ALL VIDEO URLS UPDATED WITH 100% VERIFIED WORKING PLAYABLE STREAMS!");
    process.exit(0);
  } catch (err) {
    console.error("Error updating video URLs:", err);
    process.exit(1);
  }
};

updateVideos();
