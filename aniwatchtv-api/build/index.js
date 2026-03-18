"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const routes_1 = __importDefault(require("./routes"));
// This reads “.env” and merges its contents into process.env
(0, dotenv_1.config)();
// Create the main Express application which is the server.
const app = (0, express_1.default)();
// Define the port to listen on (from .env or fallback to 3001)
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3001;
// Enable CORS so that frontend apps (like React) can access this API allowing cross-origin requests
app.use((0, cors_1.default)());
// Enable parsing of incoming JSON request bodies (POST /login with JSON data)
app.use(express_1.default.json());
// Any request that starts with "/" will be passed to the router.
// For example: if someone visits /health or /aniwatchtv/search,
// Express will send that request to the router.
// Then the router checks if any of its defined routes match,
// and if it finds a match, it runs the corresponding function.
app.use("/", routes_1.default);
app.listen(PORT, () => {
    console.log(`API is running on http://localhost:${PORT}`);
});
