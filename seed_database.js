import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { User } from "./src/Models/User.model.js";
import { Video } from "./src/Models/Video.model.js";
import { Comment } from "./src/Models/Comment.model.js";
import { Like } from "./src/Models/Like.model.js";
import { Subscription } from "./src/Models/Subscription.model.js";
import { Tweet } from "./src/Models/Tweet.model.js";
import { Playlist } from "./src/Models/Playlist.model.js";
import { Notification } from "./src/Models/Notification.model.js";
import { DB_Name } from "./src/constants.js";

dotenv.config({ path: "./.env" });

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_Name,
      family: 4
    });
    console.log("Connected to MongoDB successfully!");

    // 1. CREATING 10 REALISTIC USERS / CREATORS
    console.log("Seeding 10 Users...");
    const hashedPassword = await bcrypt.hash("Password123@", 10);

    const usersData = [
      {
        username: "cyberneo",
        email: "cyberneo@sktube.tv",
        fullName: "Neo Anderson",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces",
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=600&fit=crop",
        password: hashedPassword
      },
      {
        username: "alexcodes",
        email: "alex@sktube.tv",
        fullName: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces",
        coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&h=600&fit=crop",
        password: hashedPassword
      },
      {
        username: "sarah_ai",
        email: "sarah@sktube.tv",
        fullName: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&h=600&fit=crop",
        password: hashedPassword
      },
      {
        username: "lofi_vibes",
        email: "lofi@sktube.tv",
        fullName: "Luna Martinez",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
        coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&h=600&fit=crop",
        password: hashedPassword
      },
      {
        username: "dev_marcus",
        email: "marcus@sktube.tv",
        fullName: "Marcus Vance",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
        coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&h=600&fit=crop",
        password: hashedPassword
      },
      {
        username: "elena_cinematics",
        email: "elena@sktube.tv",
        fullName: "Elena Rostova",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces",
        coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&h=600&fit=crop",
        password: hashedPassword
      },
      {
        username: "pixel_forge",
        email: "pixelforge@sktube.tv",
        fullName: "David Sterling",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
        coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&h=600&fit=crop",
        password: hashedPassword
      },
      {
        username: "tech_titan",
        email: "titan@sktube.tv",
        fullName: "Aiden Scott",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces",
        coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&h=600&fit=crop",
        password: hashedPassword
      },
      {
        username: "maya_soundtracks",
        email: "maya@sktube.tv",
        fullName: "Maya Lin",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
        coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&h=600&fit=crop",
        password: hashedPassword
      },
      {
        username: "sam_gamereviews",
        email: "sam@sktube.tv",
        fullName: "Samuel Drake",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces",
        coverImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&h=600&fit=crop",
        password: hashedPassword
      }
    ];

    const createdUsers = [];
    for (const u of usersData) {
      let existing = await User.findOne({ username: u.username });
      if (!existing) {
        existing = await User.create(u);
      }
      createdUsers.push(existing);
    }
    console.log(`✅ Loaded ${createdUsers.length} Users`);

    // 2. CREATING 10 ULTRA HIGH-QUALITY 4K/HD VIDEOS (With verified playable MP4 streams)
    console.log("Seeding 10 Videos...");
    const sampleVideos = [
      {
        title: "Cyberpunk 2077: Phantom Liberty 4K Ray Tracing Overdrive Walkthrough",
        description: "Experience Night City like never before with full Path Tracing, DLSS 3.5 Ray Reconstruction, and ultra 4K HDR visuals captured directly on RTX 4090.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&h=720&fit=crop",
        duration: 596,
        views: 124500,
        isPublished: true,
        owner: createdUsers[0]._id
      },
      {
        title: "Building Full-Stack Real-Time Apps with React, Node.js & Socket.IO in 2026",
        description: "Master modern full-stack development. We build a high-performance streaming platform with compound components, MongoDB aggregations, and WebSockets.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
        duration: 653,
        views: 89300,
        isPublished: true,
        owner: createdUsers[1]._id
      },
      {
        title: "The Future of Generative AI & Autonomous Agent Coding Systems",
        description: "Deep dive into multi-agent systems, context compaction algorithms, and how AI coding engines construct production grade architectures in seconds.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&h=720&fit=crop",
        duration: 15,
        views: 45200,
        isPublished: true,
        owner: createdUsers[2]._id
      },
      {
        title: "Synthwave & Chill 4K Live Broadcast: Relaxing Lo-Fi Beats for Coding",
        description: "Non-stop relaxing synthwave and lo-fi melodies crafted for late-night programming sessions, deep focus, and creative flow.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1280&h=720&fit=crop",
        duration: 15,
        views: 215400,
        isPublished: true,
        owner: createdUsers[3]._id
      },
      {
        title: "Ultimate 4K Minimalist Desk Setup Tour for Senior Software Engineers",
        description: "Complete breakdown of cable management, OLED curved displays, custom mechanical keyboards, and ambient studio lighting.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1280&h=720&fit=crop",
        duration: 60,
        views: 67800,
        isPublished: true,
        owner: createdUsers[4]._id
      },
      {
        title: "Cinematic 4K Drone Footage: Iceland's Glaciers & Volcanic Highlands",
        description: "Breathtaking aerial cinematography shot on Hasselblad 8K cameras across Iceland's most remote waterfalls and obsidian black sand beaches.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1280&h=720&fit=crop",
        duration: 15,
        views: 184000,
        isPublished: true,
        owner: createdUsers[5]._id
      },
      {
        title: "Unreal Engine 5.4 Nanite & Lumen Photorealism Masterclass",
        description: "Learn how AAA studios build hyper-realistic worlds with virtualized geometry, real-time global illumination, and procedural terrain generation.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&h=720&fit=crop",
        duration: 15,
        views: 38900,
        isPublished: true,
        owner: createdUsers[6]._id
      },
      {
        title: "Next-Gen Quantum Computing & High Performance Distributed Systems",
        description: "Exploring quantum supremacy, superposition qubits, and cryogenic processors reshaping cryptography and data scale computing.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1280&h=720&fit=crop",
        duration: 52,
        views: 52100,
        isPublished: true,
        owner: createdUsers[7]._id
      },
      {
        title: "Ambient Cyber Orchestral Soundtrack: Neo Tokyo 2088",
        description: "An immersive 8-track cinematic journey combining modular analog synthesizers, cinematic brass, and deep sub-bass soundscapes.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
        thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1280&h=720&fit=crop",
        duration: 30,
        views: 94000,
        isPublished: true,
        owner: createdUsers[8]._id
      },
      {
        title: "Top 10 Most Anticipated RPGs & Open World Masterpieces Releasing Soon",
        description: "From sprawling dark fantasy epics to sci-fi tactical shooters, here are the top 10 games you need on your radar this year.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1280&h=720&fit=crop",
        duration: 734,
        views: 142000,
        isPublished: true,
        owner: createdUsers[9]._id
      }
    ];

    const createdVideos = [];
    for (const v of sampleVideos) {
      let existing = await Video.findOne({ title: v.title });
      if (!existing) {
        existing = await Video.create(v);
      }
      createdVideos.push(existing);
    }
    console.log(`✅ Loaded ${createdVideos.length} Videos`);

    // 3. SEEDING 10+ COMMENTS & REPLIES
    console.log("Seeding 10 Comments & Nested Replies...");
    const commentsData = [
      {
        content: "This path-tracing visual quality is absolutely mind blowing! Stunning 4K clarity.",
        video: createdVideos[0]._id,
        owner: createdUsers[1]._id
      },
      {
        content: "The compound component architecture and Socket.io setup in this tutorial saved me hours. Thank you!",
        video: createdVideos[1]._id,
        owner: createdUsers[2]._id
      },
      {
        content: "Autonomous multi-agent loops are definitely the future of software development.",
        video: createdVideos[2]._id,
        owner: createdUsers[0]._id
      },
      {
        content: "Listening to this while coding my backend APIs right now. Perfect focus flow!",
        video: createdVideos[3]._id,
        owner: createdUsers[4]._id
      },
      {
        content: "Where did you get that monitor arm and custom mechanical desk mat? Super clean!",
        video: createdVideos[4]._id,
        owner: createdUsers[5]._id
      },
      {
        content: "The drone shots over the volcanic black sands look like another planet. Gorgeous grading!",
        video: createdVideos[5]._id,
        owner: createdUsers[6]._id
      },
      {
        content: "Lumen real-time GI is a total game changer for indie developers.",
        video: createdVideos[6]._id,
        owner: createdUsers[7]._id
      },
      {
        content: "Quantum computing algorithms explained with such crystal clear logic. Great breakdown.",
        video: createdVideos[7]._id,
        owner: createdUsers[8]._id
      },
      {
        content: "Track 4 with that analog synth lead gave me literal chills. Adding to my playlist!",
        video: createdVideos[8]._id,
        owner: createdUsers[9]._id
      },
      {
        content: "Number 2 on this list is a must-buy on day one. Hyped for this release!",
        video: createdVideos[9]._id,
        owner: createdUsers[3]._id
      }
    ];

    const createdComments = [];
    for (const c of commentsData) {
      let existing = await Comment.findOne({ content: c.content, video: c.video });
      if (!existing) {
        existing = await Comment.create(c);
      }
      createdComments.push(existing);
    }

    // Add nested replies
    if (createdComments.length >= 2) {
      const replyData = [
        {
          content: "Totally agree! Make sure to enable DLSS 3.5 Ray Reconstruction for zero ghosting.",
          video: createdVideos[0]._id,
          owner: createdUsers[0]._id,
          parentComment: createdComments[0]._id
        },
        {
          content: "Glad it helped! We have part 2 coming out next week with WebRTC streaming support.",
          video: createdVideos[1]._id,
          owner: createdUsers[1]._id,
          parentComment: createdComments[1]._id
        }
      ];

      for (const r of replyData) {
        let existing = await Comment.findOne({ content: r.content, parentComment: r.parentComment });
        if (!existing) {
          await Comment.create(r);
        }
      }
    }
    console.log(`✅ Loaded Comments and Replies`);

    // 4. SEEDING 10 LIKES (Videos, Comments, Tweets)
    console.log("Seeding 10 Likes...");
    for (let i = 0; i < 10; i++) {
      const targetVideo = createdVideos[i % createdVideos.length];
      const likingUser = createdUsers[(i + 1) % createdUsers.length];

      await Like.findOneAndUpdate(
        { video: targetVideo._id, likedBy: likingUser._id },
        { video: targetVideo._id, likedBy: likingUser._id },
        { upsert: true }
      );
    }
    console.log(`✅ Loaded Video Likes`);

    // 5. SEEDING 10 SUBSCRIPTIONS
    console.log("Seeding 10 Subscriptions...");
    for (let i = 0; i < 10; i++) {
      const subscriber = createdUsers[i % createdUsers.length];
      const channel = createdUsers[(i + 1) % createdUsers.length];

      if (subscriber._id.toString() !== channel._id.toString()) {
        await Subscription.findOneAndUpdate(
          { subscriber: subscriber._id, channel: channel._id },
          { subscriber: subscriber._id, channel: channel._id },
          { upsert: true }
        );
      }
    }
    console.log(`✅ Loaded Subscriptions`);

    // 6. SEEDING 10 COMMUNITY POSTS / TWEETS
    console.log("Seeding 10 Community Posts (Tweets)...");
    const tweetsData = [
      {
        content: "🚀 Just finished rendering our next 4K ray-traced benchmark. Video going live tonight at 8 PM!",
        owner: createdUsers[0]._id
      },
      {
        content: "What is your favorite CSS styling approach in 2026? Vanilla CSS design tokens vs Tailwind CSS?",
        owner: createdUsers[1]._id
      },
      {
        content: "Autonomous multi-agent benchmarks are out: 40% reduction in debugging cycles with spec-driven loops.",
        owner: createdUsers[2]._id
      },
      {
        content: "New 3-hour ambient lo-fi mix drops this Friday. Streaming live for the whole weekend! 🎧",
        owner: createdUsers[3]._id
      },
      {
        content: "Finally upgraded to a 49-inch OLED 240Hz monitor. My productivity and gaming have leveled up. ⚡",
        owner: createdUsers[4]._id
      },
      {
        content: "Behind the scenes in the Icelandic highlands: capturing glaciers at -15°C with dual cinema drones. 🏔️",
        owner: createdUsers[5]._id
      },
      {
        content: "Unreal Engine 5.4 Nanite geometry performance tests are incredible. 100M polygons running at 120 FPS.",
        owner: createdUsers[6]._id
      },
      {
        content: "Quantum computing encryption updates: Why post-quantum cryptography standards matter right now.",
        owner: createdUsers[7]._id
      },
      {
        content: "Composing the soundtrack for an upcoming indie cyberpunk RPG. Vintage Moog synthesizers never disappoint. 🎹",
        owner: createdUsers[8]._id
      },
      {
        content: "Which gaming masterpiece are you replaying this weekend? Drop your recommendations below! 🎮",
        owner: createdUsers[9]._id
      }
    ];

    for (const t of tweetsData) {
      let existing = await Tweet.findOne({ content: t.content });
      if (!existing) {
        await Tweet.create(t);
      }
    }
    console.log(`✅ Loaded 10 Community Posts (Tweets)`);

    // 7. SEEDING 10 PLAYLISTS
    console.log("Seeding 10 Curated Playlists...");
    const playlistsData = [
      {
        name: "4K Masterclass & Tech Setup",
        description: "Curated collection of ultra high quality tech reviews and coding setups.",
        owner: createdUsers[0]._id,
        videos: [createdVideos[0]._id, createdVideos[4]._id, createdVideos[6]._id]
      },
      {
        name: "Full Stack Coding Architecture",
        description: "In-depth tutorials covering React, Node, WebSockets and AI architectures.",
        owner: createdUsers[1]._id,
        videos: [createdVideos[1]._id, createdVideos[2]._id]
      },
      {
        name: "Chill Lo-Fi & Focus Sounds",
        description: "The ultimate background audio for coding, reading, and relaxing.",
        owner: createdUsers[3]._id,
        videos: [createdVideos[3]._id, createdVideos[8]._id]
      },
      {
        name: "Epic Cinema & Nature 4K",
        description: "Breathtaking 4K HDR cinematography from around the globe.",
        owner: createdUsers[5]._id,
        videos: [createdVideos[5]._id, createdVideos[0]._id]
      },
      {
        name: "Gaming & Game Engine Mastery",
        description: "Next-gen game reviews, Unreal Engine tutorials, and walkthroughs.",
        owner: createdUsers[9]._id,
        videos: [createdVideos[9]._id, createdVideos[6]._id, createdVideos[0]._id]
      },
      {
        name: "AI & Future Tech Horizon",
        description: "Exploring frontier AI models and quantum computing systems.",
        owner: createdUsers[2]._id,
        videos: [createdVideos[2]._id, createdVideos[7]._id]
      },
      {
        name: "Developer Favorites 2026",
        description: "Hand-picked videos by the senior developer community.",
        owner: createdUsers[4]._id,
        videos: [createdVideos[1]._id, createdVideos[4]._id]
      },
      {
        name: "Visual Effects & 3D Lighting",
        description: "Nanite, Lumen, and ray-tracing shader deep dives.",
        owner: createdUsers[6]._id,
        videos: [createdVideos[6]._id, createdVideos[0]._id]
      },
      {
        name: "Synthwave Soundscapes",
        description: "Atmospheric cyber soundscapes and ambient melodies.",
        owner: createdUsers[8]._id,
        videos: [createdVideos[8]._id, createdVideos[3]._id]
      },
      {
        name: "Watch Later Vault",
        description: "Saved collection of top trending 4K streams.",
        owner: createdUsers[7]._id,
        videos: [createdVideos[5]._id, createdVideos[9]._id]
      }
    ];

    for (const p of playlistsData) {
      let existing = await Playlist.findOne({ name: p.name, owner: p.owner });
      if (!existing) {
        await Playlist.create(p);
      }
    }
    console.log(`✅ Loaded 10 Playlists`);

    // 8. SEEDING 10 NOTIFICATIONS
    console.log("Seeding 10 Notifications...");
    const notificationsData = [
      {
        recipient: createdUsers[0]._id,
        sender: createdUsers[1]._id,
        type: "comment",
        title: "New Comment",
        message: "Alex Rivera commented: 'This path-tracing visual quality is absolutely mind blowing!'",
        video: createdVideos[0]._id,
        link: `/watch?v=${createdVideos[0]._id}`,
        isRead: false
      },
      {
        recipient: createdUsers[1]._id,
        sender: createdUsers[2]._id,
        type: "comment",
        title: "New Reply",
        message: "Sarah Chen replied: 'The compound component architecture in this tutorial saved me hours.'",
        video: createdVideos[1]._id,
        link: `/watch?v=${createdVideos[1]._id}`,
        isRead: false
      },
      {
        recipient: createdUsers[0]._id,
        sender: createdUsers[3]._id,
        type: "like",
        title: "New Video Like",
        message: "Luna Martinez liked your video 'Cyberpunk 2077: Phantom Liberty 4K'",
        video: createdVideos[0]._id,
        link: `/watch?v=${createdVideos[0]._id}`,
        isRead: false
      },
      {
        recipient: createdUsers[0]._id,
        sender: createdUsers[4]._id,
        type: "subscribe",
        title: "New Subscriber",
        message: "Marcus Vance subscribed to your channel",
        link: `/user/${createdUsers[4].username}`,
        isRead: false
      },
      {
        recipient: createdUsers[2]._id,
        sender: createdUsers[5]._id,
        type: "video_upload",
        title: "New 4K Video Upload",
        message: "Elena Rostova uploaded: 'Cinematic 4K Drone Footage: Iceland's Glaciers'",
        video: createdVideos[5]._id,
        link: `/watch?v=${createdVideos[5]._id}`,
        isRead: false
      },
      {
        recipient: createdUsers[0]._id,
        sender: createdUsers[6]._id,
        type: "live_stream",
        title: "Live Stream Started",
        message: "David Sterling is now LIVE: 'Unreal Engine 5.4 Nanite Photorealism'",
        video: createdVideos[6]._id,
        link: `/watch?v=${createdVideos[6]._id}`,
        isRead: false
      },
      {
        recipient: createdUsers[1]._id,
        sender: createdUsers[7]._id,
        type: "like",
        title: "New Like",
        message: "Aiden Scott liked your comment on Quantum Computing",
        video: createdVideos[7]._id,
        link: `/watch?v=${createdVideos[7]._id}`,
        isRead: false
      },
      {
        recipient: createdUsers[3]._id,
        sender: createdUsers[8]._id,
        type: "subscribe",
        title: "New Subscriber",
        message: "Maya Lin subscribed to your channel",
        link: `/user/${createdUsers[8].username}`,
        isRead: false
      },
      {
        recipient: createdUsers[4]._id,
        sender: createdUsers[9]._id,
        type: "comment",
        title: "New Comment",
        message: "Samuel Drake commented: 'Where did you get that custom desk mat?'",
        video: createdVideos[4]._id,
        link: `/watch?v=${createdVideos[4]._id}`,
        isRead: false
      },
      {
        recipient: createdUsers[0]._id,
        sender: createdUsers[9]._id,
        type: "like",
        title: "New Like",
        message: "Samuel Drake liked your community post",
        link: `/community`,
        isRead: false
      }
    ];

    for (const n of notificationsData) {
      let existing = await Notification.findOne({ title: n.title, recipient: n.recipient, sender: n.sender });
      if (!existing) {
        await Notification.create(n);
      }
    }
    console.log(`✅ Loaded 10 Notifications`);

    console.log("\n🎉 ALL 10 ENTRIES FOR EVERY COLLECTION SEEDED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedDatabase();
