import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandle.js";

/**
 * =========================================================================
 * Controller 1: Health Check (JSON API)
 * Kaam: Detailed health status, uptime, database & services status
 * Method: GET | Route: /api/v1/healthcheck & /healthz
 * =========================================================================
 */
const healthcheck = asyncHandler(async (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                status: "healthy",
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || "development",
                services: {
                    database: isDbConnected ? "connected" : "disconnected",
                    mediaStorage: "Cloudinary CDN Ready",
                    realtimeEvents: "Socket.IO Active"
                }
            },
            "Server is up and running"
        )
    );
});

/**
 * =========================================================================
 * Controller 2: Root Landing Page (HTML Dashboard)
 * Kaam: Renders a sleek, responsive status dashboard when visiting backend URL
 * Method: GET | Route: /
 * =========================================================================
 */
const rootLandingPage = (req, res) => {
    const uptimeSeconds = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;
    const isDbConnected = mongoose.connection.readyState === 1;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SKTUBE API | Enterprise 4K Video Streaming Backend</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #09090b;
      color: #f4f4f5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow-x: hidden;
    }
    /* Subtle background ambient glow */
    .bg-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(255, 0, 85, 0.12) 0%, rgba(255, 0, 85, 0) 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 0;
    }
    .container {
      width: 100%;
      max-width: 760px;
      background: rgba(18, 18, 24, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 40px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 0, 85, 0.08);
      position: relative;
      z-index: 1;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 24px;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #FF0055 0%, #FF2E7E 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(255, 0, 85, 0.35);
    }
    .logo-badge svg {
      width: 22px;
      height: 22px;
      fill: #ffffff;
      margin-left: 2px;
    }
    .logo-text h1 {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .logo-text p {
      font-size: 12px;
      color: #71717a;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-size: 13px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 9999px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite ease-in-out;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 16px 20px;
      transition: all 0.2s ease;
    }
    .card:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
    }
    .card-label {
      font-size: 11px;
      color: #a1a1aa;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.75px;
      margin-bottom: 6px;
    }
    .card-value {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .card-value.online { color: #34d399; }
    .card-value.highlight { color: #FF2E7E; }
    .endpoints-title {
      font-size: 13px;
      color: #a1a1aa;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .endpoints-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 32px;
    }
    .endpoint-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 10px 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      color: #e4e4e7;
    }
    .endpoint-method {
      font-weight: 700;
      color: #38bdf8;
      font-size: 11px;
      background: rgba(56, 189, 248, 0.1);
      padding: 3px 8px;
      border-radius: 6px;
      margin-right: 10px;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 22px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: #FF0055;
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(255, 0, 85, 0.35);
    }
    .btn-primary:hover {
      background: #e0004c;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e4e4e7;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 11.5px;
      color: #52525b;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="bg-glow"></div>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <div class="logo-badge">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
        <div class="logo-text">
          <h1>SKTUBE API</h1>
          <p>Enterprise 4K Streaming Engine</p>
        </div>
      </div>
      <div class="status-pill">
        <div class="pulse-dot"></div>
        <span>Operational</span>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-label">Server Status</div>
        <div class="card-value online">● Healthy 200 OK</div>
      </div>
      <div class="card">
        <div class="card-label">Database</div>
        <div class="card-value ${isDbConnected ? 'online' : 'highlight'}">
          ${isDbConnected ? '● MongoDB Atlas Connected' : '● Reconnecting'}
        </div>
      </div>
      <div class="card">
        <div class="card-label">Server Uptime</div>
        <div class="card-value">${uptimeFormatted}</div>
      </div>
      <div class="card">
        <div class="card-label">CDN & Storage</div>
        <div class="card-value highlight">Cloudinary 4K</div>
      </div>
    </div>

    <div class="endpoints-title">Core API Surface</div>
    <div class="endpoints-list">
      <div class="endpoint-item">
        <div><span class="endpoint-method">GET</span>/api/v1/healthcheck</div>
        <span style="color:#71717a; font-size:11px;">System Health Probe</span>
      </div>
      <div class="endpoint-item">
        <div><span class="endpoint-method">GET</span>/api/v1/videos</div>
        <span style="color:#71717a; font-size:11px;">Feed & Video Stream Query</span>
      </div>
      <div class="endpoint-item">
        <div><span class="endpoint-method">POST</span>/api/v1/users/login</div>
        <span style="color:#71717a; font-size:11px;">JWT Secure Authentication</span>
      </div>
      <div class="endpoint-item">
        <div><span class="endpoint-method">WS</span>/socket.io</div>
        <span style="color:#71717a; font-size:11px;">Real-Time Watch Party & Sync</span>
      </div>
    </div>

    <div class="actions">
      <a href="/api/v1/healthcheck" class="btn btn-primary" target="_blank">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        View JSON Healthcheck
      </a>
      <a href="/healthz" class="btn btn-secondary">
        Cloud Probe (/healthz)
      </a>
    </div>
  </div>
  <div class="footer">
    SKTUBE Video Streaming Engine &bull; Built with Express, MongoDB Atlas, Redis & Cloudinary
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
};

export { healthcheck, rootLandingPage };

