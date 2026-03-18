import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Subscribed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "monthly";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        const token = await user.getIdToken();
        await axios.post(
          "http://localhost:3002/mark-premium",
          { uid: user.uid, plan },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Failed to mark user as premium:", err.response?.data || err.message);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [plan]);

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.gridOverlay} />
        <div style={s.scanlines} />
        <Navbar />
        <div style={s.centered}>
          <div style={s.spinner} />
          <p style={s.loadingText}>ACTIVATING PREMIUM...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />
      <Navbar />

      <div style={s.centered}>
        <div style={s.card}>
          <div style={s.iconRow}>
            <div style={s.crownIcon}>◈</div>
          </div>
          <h1 style={s.title}>PREMIUM ACTIVATED</h1>
          <div style={s.titleGlow} />
          <p style={s.subtitle}>
            Welcome to AniHub Premium. You now have full access to exclusive episodes,
            high-quality streams, and all premium perks.
          </p>
          <div style={s.planBadge}>
            <span style={s.planLabel}>PLAN</span>
            <span style={s.planValue}>{plan.toUpperCase()}</span>
          </div>
          <button
            style={s.homeBtn}
            onClick={() => navigate("/home")}
            onMouseEnter={e => Object.assign(e.currentTarget.style, s.homeBtnHover)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, s.homeBtn)}
          >
            ENTER ANIHUB ▶▶
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const s = {
  page: {
    background: "radial-gradient(ellipse at 15% 35%, rgba(88,80,220,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(56,189,248,0.08) 0%, transparent 45%), radial-gradient(ellipse at 55% 85%, rgba(192,132,252,0.1) 0%, transparent 50%), #07071a", minHeight: "100vh",
    position: "relative", overflowX: "hidden",
    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
    display: "flex", flexDirection: "column",
  },
  gridOverlay: {
    position: "fixed", inset: 0,
    backgroundImage: `linear-gradient(rgba(88,80,220,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(88,80,220,0.05) 1px, transparent 1px)`,
    backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0,
  },
  scanlines: {
    position: "fixed", inset: 0,
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
    pointerEvents: "none", zIndex: 1,
  },
  centered: {
    position: "relative", zIndex: 2, flex: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "2rem",
  },
  card: {
    maxWidth: 520, width: "100%", textAlign: "center",
    background: "rgba(251,191,36,0.02)",
    border: "1px solid rgba(251,191,36,0.2)",
    boxShadow: "0 0 60px rgba(251,191,36,0.04)",
    padding: "3rem 2.5rem",
  },
  iconRow: { marginBottom: "1.5rem" },
  crownIcon: { fontSize: "2.5rem", color: "#fbbf24", textShadow: "0 0 30px #fbbf24, 0 0 60px #fbbf2455" },
  title: {
    fontSize: "clamp(1.2rem, 4vw, 1.8rem)", fontWeight: 900,
    color: "#fbbf24", letterSpacing: "0.15em", margin: "0 0 0.75rem",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    textShadow: "0 0 30px #fbbf24, 0 0 60px #fbbf2455",
  },
  titleGlow: {
    width: 80, height: 2, margin: "0 auto 1.5rem",
    background: "linear-gradient(to right, transparent, #fbbf24, transparent)",
  },
  subtitle: { color: "#666", fontSize: "0.82rem", lineHeight: 1.7, letterSpacing: "0.06em", marginBottom: "2rem" },
  planBadge: {
    display: "inline-flex", alignItems: "center", gap: "0.75rem",
    background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)",
    padding: "0.5rem 1.25rem", marginBottom: "2rem",
  },
  planLabel: { color: "#444", fontSize: "0.6rem", letterSpacing: "0.3em" },
  planValue: { color: "#fbbf24", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.2em" },
  homeBtn: {
    background: "rgba(251,191,36,0.08)", color: "#fbbf24",
    border: "1px solid rgba(251,191,36,0.5)",
    padding: "0.8rem 2.5rem",
    fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.25em",
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
  },
  homeBtnHover: {
    background: "#fbbf24", color: "#000",
    border: "1px solid #fbbf24",
    boxShadow: "0 0 30px rgba(251,191,36,0.4)",
    padding: "0.8rem 2.5rem",
    fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.25em",
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
  },
  spinner: {
    width: 36, height: 36,
    border: "2px solid rgba(251,191,36,0.15)",
    borderTopColor: "#fbbf24", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#444", fontSize: "0.75rem", letterSpacing: "0.3em", margin: 0 },
};
