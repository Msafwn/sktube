import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";
import { redis } from "../src/utils/redis.js";

describe("SKTUBE Backend API Tests", () => {
    // Clean up Redis client connection after all tests finish
    after(() => {
        try {
            redis.disconnect();
        } catch {
            // Ignore disconnect errors in test runner
        }
    });

    describe("1. Health Check Endpoint", () => {
        it("GET /api/v1/healthcheck should return 200 and healthy status", async () => {
            const res = await request(app).get("/api/v1/healthcheck");

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.status, "healthy");
            assert.ok(typeof res.body.data.uptime === "number");
        });
    });

    describe("2. 404 Unknown Route Handling", () => {
        it("GET /api/v1/unknown-endpoint should return 404 with standard error format", async () => {
            const res = await request(app).get("/api/v1/unknown-endpoint");

            assert.strictEqual(res.status, 404);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /not found/i);
        });
    });

    describe("3. User Registration Validations (POST /api/v1/users/register)", () => {
        it("should return 400 when required fields are missing", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({});

            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /missing/i);
        });

        it("should return 400 when email format is invalid", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({
                    username: "testuser",
                    fullName: "Test User",
                    password: "securepassword123",
                    email: "not-an-email"
                });

            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /valid email/i);
        });

        it("should return 400 when password is less than 8 characters", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({
                    username: "testuser",
                    fullName: "Test User",
                    password: "123",
                    email: "test@example.com"
                });

            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /at least 8 characters/i);
        });

        it("should return 400 when username is less than 3 characters", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({
                    username: "ab",
                    fullName: "Test User",
                    password: "securepassword123",
                    email: "test@example.com"
                });

            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /at least 3 characters/i);
        });
    });

    describe("4. User Login Validations (POST /api/v1/users/login)", () => {
        it("should return 400 when credentials are empty", async () => {
            const res = await request(app)
                .post("/api/v1/users/login")
                .send({});

            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /required/i);
        });

        it("should return 400 when password is missing", async () => {
            const res = await request(app)
                .post("/api/v1/users/login")
                .send({
                    email: "test@example.com"
                });

            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /password/i);
        });
    });

    describe("5. CSRF Protection Middleware", () => {
        it("should reject cross-site state mutation requests with 403 Forbidden", async () => {
            const res = await request(app)
                .post("/api/v1/users/login")
                .set("Sec-Fetch-Site", "cross-site")
                .send({ email: "test@example.com", password: "password123" });

            assert.strictEqual(res.status, 403);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /CSRF/i);
        });

        it("should allow safe read-only GET requests from any site", async () => {
            const res = await request(app)
                .get("/api/v1/healthcheck")
                .set("Sec-Fetch-Site", "cross-site");

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
        });
    });
});
