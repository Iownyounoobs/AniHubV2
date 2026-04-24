import React, { useState } from "react";
import {
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";
import Navbar from "../components/Navbar";

export default function ChangeAccount() {
  const user = firebaseAuth.currentUser;

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const reauthenticateUser = async (u, password) => {
    const credential = EmailAuthProvider.credential(u.email, password);
    return reauthenticateWithCredential(u, credential);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      if (newUsername) {
        if (newUsername.length > 50) throw new Error("Username must be 50 characters or less.");
        await updateProfile(user, { displayName: newUsername.trim() });
      }
      if (newPassword) {
        if (!currentPassword) throw new Error("Enter your current password to change it.");
        if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");
        await reauthenticateUser(user, currentPassword);
        await updatePassword(user, newPassword);
      }
      setMessage("Account updated successfully.");
    } catch (err) {
      const code = err.code || "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Current password is incorrect.");
      } else if (code === "auth/weak-password") {
        setError("New password is too weak. Use at least 8 characters.");
      } else if (code === "auth/requires-recent-login") {
        setError("Session expired. Please log out and log back in, then try again.");
      } else if (err.message && !code) {
        setError(err.message);
      } else {
        setError("Failed to update account. Please try again.");
      }
    }
  };

  const inputFocus = (e) => {
    e.currentTarget.style.borderColor = "rgba(56,189,248,0.6)";
    e.currentTarget.style.boxShadow = "0 0 12px rgba(56,189,248,0.1)";
    e.currentTarget.style.color = "#fff";
  };
  const inputBlur = (e) => {
    e.currentTarget.style.borderColor = "rgba(56,189,248,0.2)";
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.color = "#c8dde8";
  };

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />
      <Navbar />

      <div style={s.container}>
        <div style={s.pageHeader}>
          <div style={s.accentBar} />
          <h1 style={s.pageTitle}>ACCOUNT SETTINGS</h1>
          <div style={s.headerLine} />
        </div>

        <div style={s.card}>
          <form onSubmit={handleUpdate} style={s.form}>
            <div style={s.inputGroup}>
              <label style={s.label}>NEW USERNAME</label>
              <input
                type="text"
                placeholder="Enter new username"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                style={s.input}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>

            <div style={s.sectionDivider}>
              <div style={s.dividerLine} />
              <span style={s.dividerLabel}>PASSWORD CHANGE</span>
              <div style={s.dividerLine} />
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>CURRENT PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                style={s.input}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>NEW PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={s.input}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>

            <button
              type="submit"
              style={s.submitBtn}
              onMouseEnter={e => Object.assign(e.currentTarget.style, s.submitBtnHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, s.submitBtn)}
            >
              SAVE CHANGES
            </button>
          </form>

          {message && (
            <div style={s.successMsg}>
              <span style={s.successDot} />
              {message}
            </div>
          )}
          {error && (
            <div style={s.errorMsg}>
              <span style={s.errorDot} />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    background: "radial-gradient(ellipse at 15% 35%, rgba(88,80,220,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(56,189,248,0.08) 0%, transparent 45%), radial-gradient(ellipse at 55% 85%, rgba(192,132,252,0.1) 0%, transparent 50%), #07071a", minHeight: "100vh",
    position: "relative", overflowX: "hidden",
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
    position: "relative", zIndex: 2, maxWidth: 560,
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

  card: {
    background: "rgba(56,189,248,0.03)",
    border: "1px solid rgba(56,189,248,0.18)",
    padding: "2.5rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  label: { color: "#7aa8c4", fontSize: "0.68rem", letterSpacing: "0.3em" },
  input: {
    background: "rgba(56,189,248,0.04)",
    border: "1px solid rgba(56,189,248,0.2)",
    borderRadius: 0, color: "#c8dde8",
    padding: "0.85rem 1rem",
    fontSize: "0.9rem", letterSpacing: "0.05em",
    fontFamily: "'Share Tech Mono', monospace",
    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s, color 0.2s",
    width: "100%", boxSizing: "border-box",
  },
  sectionDivider: { display: "flex", alignItems: "center", gap: "0.75rem" },
  dividerLine: { flex: 1, height: 1, background: "rgba(56,189,248,0.1)" },
  dividerLabel: { color: "#6b8fa8", fontSize: "0.62rem", letterSpacing: "0.3em", whiteSpace: "nowrap" },

  submitBtn: {
    background: "rgba(56,189,248,0.08)", color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.5)",
    padding: "0.85rem", width: "100%",
    fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.25em",
    cursor: "pointer", transition: "all 0.2s", marginTop: "0.5rem",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
  },
  submitBtnHover: {
    background: "#38bdf8", color: "#000",
    border: "1px solid #38bdf8",
    boxShadow: "0 0 30px rgba(56,189,248,0.4)",
    padding: "0.85rem", width: "100%",
    fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.25em",
    cursor: "pointer", transition: "all 0.2s", marginTop: "0.5rem",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
  },
  successMsg: {
    display: "flex", alignItems: "center", gap: "0.6rem",
    marginTop: "1.5rem", color: "#38bdf8",
    fontSize: "0.82rem", letterSpacing: "0.1em",
  },
  successDot: { width: 7, height: 7, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 10px #38bdf8", flexShrink: 0 },
  errorMsg: {
    display: "flex", alignItems: "center", gap: "0.6rem",
    marginTop: "1.5rem", color: "#ff6b6b",
    fontSize: "0.82rem", letterSpacing: "0.1em",
  },
  errorDot: { width: 7, height: 7, borderRadius: "50%", background: "#ff6b6b", boxShadow: "0 0 8px #ff6b6b66", flexShrink: 0 },
};
