"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Import the sub-router that handles all /aniwatchtv routes; automatically imports from ./aniwatchtv/index.ts
const aniwatchtv_1 = __importDefault(require("./aniwatchtv"));
// Import the root handler that checks if aniwatchtv.to is reachable
const aniwatchStatusHandler_1 = __importDefault(require("../utils/aniwatchStatusHandler"));
// This is the main router for the API. It handles all routes that start with /aniwatchtv
// - It will handle paths like /search, /anime/:id, etc. 
// - attach this router to the main app using app.use("/aniwatchtv", router)
// - That makes all the routes in here accessible under /aniwatchtv
const router = (0, express_1.Router)();
/**
 * When sending a GET request to the root route http://locahost:3000, it will run the
 * rootHandler function to check if aniwatchtv.to is online
 * Returns: { aniwatch: true | false }
 */
router.get("/", aniwatchStatusHandler_1.default);
/**
 * Simple health check route to confirm if the server is running.
 * When a GET request is sent to /health, it returns a basic JSON message with a timestamp.
 * Also logs to the console when the route is accessed — useful for verifying it's being hit.
 * _req: not used, so it's prefixed with an underscore to indicate it's intentionally ignored.
 * Returns: {status: "healthy", timestamp: "2000-01-01T12:00:00Z", message: "AniwatchTV API is running"}
 */
router.get("/health", (_req, res) => {
    console.log("/health route was accessed at", new Date().toISOString());
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        message: "AniwatchTV API is running",
    });
});
/**
 * Mounts the aniwatchTVRouter at the path /aniwatchtv.
 * - When someone visits a route that starts with /aniwatchtv (like /aniwatchtv/search),
 *   Express passes the request to aniwatchTVRouter.
 * Inside aniwatchTVRouter:
 * - Express strips off the /aniwatchtv part
 * - Then it tries to match whatever comes after — like /search, /anime/:id, etc.
 * So:
 * - GET /aniwatchtv/search → becomes /search inside aniwatchTVRouter
 * - aniwatchTVRouter looks for: router.get("/search") and runs that function
 */
router.use("/aniwatchtv", aniwatchtv_1.default);
// Export the router for use in the main app
exports.default = router;
