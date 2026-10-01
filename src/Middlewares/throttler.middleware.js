import { slowDown } from "express-slow-down";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../utils/redis.js";

const createStore = (prefix) => {
    if (process.env.NODE_ENV === "test") {
        return undefined; // Use in-memory store during automated tests
    }
    return new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: `rl:slow:${prefix}:`
    });
};

/**
 * 1. General API Speed Throttler
 * Starts adding progressive delay (+500ms per request) after 50 requests in a 15-minute window.
 * Max delay is capped at 2000ms (2 seconds).
 * Legitimate users enjoy normal speed, while abusive scrapers/bots are progressively slowed down.
 * Backed by Redis for cluster-wide enforcement.
 */
export const speedThrottler = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow first 50 requests at full speed
    delayMs: (hits) => (hits - 50) * 500, // Add 500ms per request after 50
    maxDelayMs: 2000, // Maximum delay of 2 seconds
    store: createStore("general"),
    validate: { delayMs: false, default: false }
});

/**
 * 2. Sensitive Action Throttler (Comments & Likes)
 * Adds progressive delay after 20 rapid actions in 5 minutes.
 * Backed by Redis for cluster-wide enforcement.
 */
export const actionThrottler = slowDown({
    windowMs: 5 * 60 * 1000, // 5 minutes
    delayAfter: 20, // Allow 20 actions at full speed
    delayMs: (hits) => (hits - 20) * 300, // Add 300ms delay per extra action
    maxDelayMs: 1500,
    store: createStore("action"),
    validate: { delayMs: false, default: false }
});
