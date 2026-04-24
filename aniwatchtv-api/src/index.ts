import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";
import router from "./routes";

config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// Trust Railway/Vercel proxy so rate-limiter reads the real client IP
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS — only allow the configured frontend origin
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET"],
    optionsSuccessStatus: 200,
  })
);

// Request size limit
app.use(express.json({ limit: "50kb" }));

// General rate limit: 120 req / minute per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please slow down." },
  })
);

// Tighter limit on search to prevent scraping abuse: 30 req / minute
app.use(
  "/aniwatchtv/search",
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Search rate limit exceeded." },
  })
);

app.use("/", router);

app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});
