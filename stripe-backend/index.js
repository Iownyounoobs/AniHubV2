require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");

const app = express();

// Security headers
app.use(helmet());

// CORS — only allow configured frontend origins
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
  })
);

// Stripe webhook must receive raw body — mount BEFORE express.json()
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not set");
      return res.status(500).send("Webhook secret not configured");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const uid = session.metadata?.uid;
      const plan = session.metadata?.plan;

      if (uid && plan) {
        try {
          await markUserPremium(uid, plan);
          console.log(`Premium activated via webhook for uid=${uid} plan=${plan}`);
        } catch (err) {
          console.error("Failed to mark premium via webhook:", err.message);
        }
      }
    }

    res.json({ received: true });
  }
);

// JSON body parsing for all other routes
app.use(express.json({ limit: "50kb" }));

// Rate limiting
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests." },
  })
);

// Validate Firebase config
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) {
  console.error("Missing Firebase config in .env");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();
const PORT = process.env.PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const PRICES = {
  monthly: Number(process.env.STRIPE_MONTHLY_PRICE_CENTS) || 500,
  yearly:  Number(process.env.STRIPE_YEARLY_PRICE_CENTS)  || 4500,
};

async function markUserPremium(uid, plan) {
  const now = admin.firestore.Timestamp.now();
  const durations = { monthly: 30, yearly: 365 };
  const days = durations[plan];
  if (!days) throw new Error("Invalid plan");

  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date(now.toDate().getTime() + days * 24 * 60 * 60 * 1000)
  );

  await db.collection("users").doc(uid).set(
    { isPremium: true, subscriptionPlan: plan, subscribedAt: now, subscriptionEndsAt: expiresAt },
    { merge: true }
  );
}

// Create Stripe Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  const { uid, plan } = req.body;

  if (!uid || typeof uid !== "string" || uid.length > 128) {
    return res.status(400).json({ error: "Invalid request." });
  }

  if (!PRICES[plan]) {
    return res.status(400).json({ error: "Invalid subscription plan." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: { uid, plan },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `AniHub ${plan} subscription` },
            unit_amount: PRICES[plan],
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/subscribed?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/subscribe`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err.message);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
});

// Mark user as premium — verifies Stripe session before writing to Firestore
app.post("/mark-premium", async (req, res) => {
  const { uid, plan, sessionId } = req.body;
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) return res.status(401).json({ error: "Unauthorized." });
  if (!sessionId) return res.status(400).json({ error: "Missing session ID." });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (decoded.uid !== uid) return res.status(403).json({ error: "UID mismatch." });

    // Verify the Stripe session actually completed payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(402).json({ error: "Payment not completed." });
    }
    if (session.metadata?.uid !== uid) {
      return res.status(403).json({ error: "Session does not belong to this user." });
    }

    const resolvedPlan = session.metadata?.plan || plan;
    if (!PRICES[resolvedPlan]) {
      return res.status(400).json({ error: "Invalid plan." });
    }

    await markUserPremium(uid, resolvedPlan);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("mark-premium error:", err.message);
    res.status(401).json({ error: "Unauthorized." });
  }
});

app.listen(PORT, () => {
  console.log(`Stripe backend running at http://localhost:${PORT}`);
});
