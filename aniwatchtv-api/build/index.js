"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = require("dotenv");
const routes_1 = __importDefault(require("./routes"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3001;
// Security headers
app.use((0, helmet_1.default)());
// CORS — only allow the configured frontend origin
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET"],
    optionsSuccessStatus: 200,
}));
// Request size limit
app.use(express_1.default.json({ limit: "50kb" }));
// General rate limit: 120 req / minute per IP
app.use((0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please slow down." },
}));
// Tighter limit on search to prevent scraping abuse: 30 req / minute
app.use("/aniwatchtv/search", (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Search rate limit exceeded." },
}));
app.use("/", routes_1.default);
app.listen(PORT, () => {
    console.log(`API is running on http://localhost:${PORT}`);
});
