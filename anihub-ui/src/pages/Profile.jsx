import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />
      <Navbar />

      <div style={s.container}>
        <div style={s.pageHeader}>
          <div style={s.accentBar} />
          <h1 style={s.pageTitle}>USER PROFILE</h1>
          <div style={s.headerLine} />
        </div>

        {user ? (
          <div style={s.profileCard}>
            <div style={s.avatarSection}>
              <div style={s.avatar}>
                <span style={s.avatarInitial}>
                  {(user.displayName || user.email || "?")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p style={s.displayName}>{user.displayName || "ANONYMOUS"}</p>
                <p style={s.email}>{user.email}</p>
              </div>
            </div>

            <div style={s.divider} />

            <div style={s.statsGrid}>
              <div style={s.statBlock}>
                <span style={s.statLabel}>STATUS</span>
                <span style={s.statValueFree}>◈ MEMBER</span>
              </div>
              <div style={s.statBlock}>
                <span style={s.statLabel}>JOINED</span>
                <span style={s.statValue}>
                  {new Date(user.metadata?.creationTime).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div style={s.divider} />

            <div style={s.actions}>
              <button
                style={s.actionBtn}
                onClick={() => navigate("/change-account")}
                onMouseEnter={e => Object.assign(e.currentTarget.style, s.actionBtnHover)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, s.actionBtn)}
              >
                ◈ &nbsp;ACCOUNT SETTINGS
              </button>
            </div>
          </div>
        ) : (
          <div style={s.loading}>LOADING USER DATA...</div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    background: "radial-gradient(ellipse at 15% 35%, rgba(88,80,220,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(56,189,248,0.08) 0%, transparent 45%), radial-gradient(ellipse at 55% 85%, rgba(192,132,252,0.1) 0%, transparent 50%), #07071a",
    minHeight: "100vh", position: "relative", overflowX: "hidden",
    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
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
  container: {
    position: "relative", zIndex: 2, maxWidth: 600,
    margin: "0 auto", padding: "0 2rem 4rem", paddingTop: "8rem",
  },
  pageHeader: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" },
  accentBar: { width: 4, height: 28, borderRadius: 2, flexShrink: 0, background: "#38bdf8", boxShadow: "0 0 12px #38bdf8" },
  pageTitle: {
    fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.25em", margin: 0,
    color: "#38bdf8", textShadow: "0 0 18px #38bdf8", whiteSpace: "nowrap",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
  },
  headerLine: { flex: 1, height: 1, opacity: 0.5, background: "linear-gradient(to right, rgba(56,189,248,0.4), transparent)" },
  loading: { textAlign: "center", padding: "4rem", color: "#888", letterSpacing: "0.2em", fontSize: "0.85rem" },
  profileCard: { background: "rgba(56,189,248,0.03)", border: "1px solid rgba(56,189,248,0.18)", padding: "2.5rem" },
  avatarSection: { display: "flex", alignItems: "center", gap: "2rem", marginBottom: "1.5rem" },
  avatar: {
    width: 84, height: 84, borderRadius: "50%",
    background: "rgba(56,189,248,0.1)", border: "2px solid rgba(56,189,248,0.5)",
    boxShadow: "0 0 30px rgba(56,189,248,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  avatarInitial: { color: "#38bdf8", fontSize: "2rem", fontWeight: 700, fontFamily: "'Orbitron', monospace" },
  displayName: { color: "#fff", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 0.4rem" },
  email: { color: "#8aa4be", fontSize: "0.82rem", letterSpacing: "0.08em", margin: 0 },
  divider: { height: 1, background: "rgba(56,189,248,0.1)", margin: "1.75rem 0" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" },
  statBlock: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  statLabel: { color: "#6b8fa8", fontSize: "0.62rem", letterSpacing: "0.35em" },
  statValue: { color: "#c8dde8", fontSize: "0.88rem", letterSpacing: "0.08em" },
  statValueFree: { color: "#38bdf8", fontSize: "0.88rem", letterSpacing: "0.08em" },
  actions: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  actionBtn: {
    background: "transparent", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)",
    padding: "0.85rem 1.5rem", width: "100%", fontSize: "0.85rem", fontWeight: 700,
    letterSpacing: "0.2em", cursor: "pointer", transition: "all 0.2s", textAlign: "left",
    fontFamily: "'Share Tech Mono', monospace",
  },
  actionBtnHover: {
    background: "rgba(56,189,248,0.08)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.6)",
    boxShadow: "0 0 14px rgba(56,189,248,0.12)", padding: "0.85rem 1.5rem", width: "100%",
    fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.2em", cursor: "pointer",
    transition: "all 0.2s", textAlign: "left", fontFamily: "'Share Tech Mono', monospace",
  },
};
