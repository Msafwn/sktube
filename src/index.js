import http from "http";
import dotenv from "dotenv";
import connectDB from "./db/Connection.js";
import { app } from "./app.js";
import { initSocket } from "./socket/index.js";

// 1. Environment variables (.env file) ko load karein
dotenv.config({
    path: "./.env",
});

// 2. HTTP Server create karein (Express app ke sath)
const httpServer = http.createServer(app);

// 3. Socket.IO engine initialize karein
initSocket(httpServer);

// 4. Pehle Database connect karein, phir HTTP + WebSocket server start karein
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;
        httpServer.listen(PORT, "0.0.0.0", () => {
            console.log(`⚙️  Server (HTTP + Socket.IO) is running on port: ${PORT}`);
        });

        // Server level errors (jaise port already in use) ko catch karein
        httpServer.on("error", (error) => {
            console.error("Server execution error:", error);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed !!!", error);
    });