import React, { useState } from "react";
import { firebaseAuth, firestore } from "../utils/firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setError("");
  };

  const handleSignUp = async () => {
    const { email, password } = formValues;
    if (!email || !password) { setError("Please fill in both fields."); return; }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await setDoc(doc(firestore, "users", user.uid), { email: user.email });
      setTimeout(() => { setLoading(false); navigate("/home"); }, 2000);
    } catch (err) {
      console.error("Signup failed:", err.message);
      setError("Signup failed. Try a different email.");
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSignUp(); };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.gridOverlay} />
        <div style={s.scanlines} />
        <div style={s.centered}>
          <div style={s.spinner} />
          <p style={s.loadingText}>CREATING ACCOUNT...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />

      <div style={s.centered}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logo}>
            <span style={s.logoAni}>ANI</span>
            <span style={s.logoHub}>HUB</span>
          </div>
          <p style={s.logoTagline}>Join the community.</p>
        </div>

        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardAccent} />
            <span style={s.cardTitle}>NEW USER REGISTRATION</span>
          </div>

          <div style={s.form}>
            <div style={s.inputGroup}>
              <label style={s.label}>EMAIL</label>
              <input
                type="email"
                name="email"
                placeholder="user@domain.com"
                value={formValues.email}
                onChange={handleInputChange}
                onKeyDown={handleKey}
                style={s.input}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(192,132,252,0.7)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(192,132,252,0.15)"; e.currentTarget.style.color = "#fff"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(192,132,252,0.25)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.color = "#d0b8f0"; }}
              />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>PASSWORD</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formValues.password}
                onChange={handleInputChange}
                onKeyDown={handleKey}
                style={s.input}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(192,132,252,0.7)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(192,132,252,0.15)"; e.currentTarget.style.color = "#fff"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(192,132,252,0.25)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.color = "#d0b8f0"; }}
              />
            </div>

            {error && <p style={s.errorText}>{error}</p>}

            <button
              onClick={handleSignUp}
              style={s.primaryBtn}
              onMouseEnter={e => Object.assign(e.currentTarget.style, s.primaryBtnHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, s.primaryBtn)}
            >
              CREATE ACCOUNT
            </button>

            <div style={s.orRow}>
              <div style={s.orLine} />
              <span style={s.orText}>OR</span>
              <div style={s.orLine} />
            </div>

            <button
              onClick={() => navigate("/login")}
              style={s.secondaryBtn}
              onMouseEnter={e => Object.assign(e.currentTarget.style, s.secondaryBtnHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, s.secondaryBtn)}
            >
              LOGIN
            </button>
          </div>
        </div>

        {/* Credit */}
        <div style={s.credit}>
          <span style={s.creditSite}>ANIHUB</span>
          <span style={s.creditDot}>·</span>
          <span style={s.creditText}>Developed by <span style={s.creditName}>JimmieXiong</span></span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const s = {
  page: {
    background: "radial-gradient(ellipse at 15% 35%, rgba(88,80,220,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(56,189,248,0.08) 0%, transparent 45%), radial-gradient(ellipse at 55% 85%, rgba(192,132,252,0.1) 0%, transparent 50%), #07071a",
    minHeight: "100vh", position: "relative", overflowX: "hidden",
    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
    display: "flex", alignItems: "center", justifyContent: "center",
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
    position: "relative", zIndex: 2,
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "2rem",
    width: "100%", maxWidth: 500, padding: "2rem",
  },

  logoWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" },
  logo: {
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    fontSize: "3.8rem", fontWeight: 900, letterSpacing: "0.12em",
  },
  logoAni: { color: "#38bdf8", textShadow: "0 0 24px rgba(56,189,248,0.7), 0 0 60px rgba(56,189,248,0.25)" },
  logoHub: { color: "#c084fc", textShadow: "0 0 24px rgba(192,132,252,0.7), 0 0 60px rgba(192,132,252,0.25)" },
  logoTagline: { color: "#60607a", fontSize: "0.82rem", letterSpacing: "0.2em", margin: 0 },

  card: {
    width: "100%",
    background: "rgba(192,132,252,0.03)",
    border: "1px solid rgba(192,132,252,0.2)",
    boxShadow: "0 0 60px rgba(192,132,252,0.06)",
  },
  cardHeader: {
    display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "1.1rem 1.75rem",
    borderBottom: "1px solid rgba(192,132,252,0.1)",
  },
  cardAccent: { width: 4, height: 18, background: "#c084fc", boxShadow: "0 0 10px #c084fc", borderRadius: 2 },
  cardTitle: { color: "rgba(192,132,252,0.75)", fontSize: "0.75rem", letterSpacing: "0.35em" },

  form: { display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.75rem" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "0.55rem" },
  label: { color: "#a880cc", fontSize: "0.78rem", letterSpacing: "0.28em", fontWeight: 700 },
  input: {
    background: "rgba(192,132,252,0.04)",
    border: "1px solid rgba(192,132,252,0.25)",
    borderRadius: 0, color: "#d0b8f0",
    padding: "0.9rem 1.1rem",
    fontSize: "0.95rem", letterSpacing: "0.05em",
    fontFamily: "'Share Tech Mono', monospace",
    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s, color 0.2s",
    width: "100%", boxSizing: "border-box",
  },
  errorText: { color: "#f87171", fontSize: "0.82rem", letterSpacing: "0.08em", margin: 0 },

  primaryBtn: {
    background: "rgba(192,132,252,0.1)", color: "#c084fc",
    border: "1px solid rgba(192,132,252,0.5)",
    padding: "1rem", width: "100%",
    fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.3em",
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
  },
  primaryBtnHover: {
    background: "#c084fc", color: "#000",
    border: "1px solid #c084fc",
    boxShadow: "0 0 32px rgba(192,132,252,0.4)",
    padding: "1rem", width: "100%",
    fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.3em",
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
  },
  orRow: { display: "flex", alignItems: "center", gap: "1rem" },
  orLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.08)" },
  orText: { color: "#5a5a72", fontSize: "0.75rem", letterSpacing: "0.3em" },

  secondaryBtn: {
    background: "transparent", color: "#9090b0",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "1rem", width: "100%",
    fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.3em",
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
  },
  secondaryBtnHover: {
    background: "rgba(56,189,248,0.1)", color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.5)",
    boxShadow: "0 0 22px rgba(56,189,248,0.15)",
    padding: "1rem", width: "100%",
    fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.3em",
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
  },

  credit: { display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" },
  creditSite: {
    color: "#c084fc", fontSize: "0.82rem", fontWeight: 700,
    letterSpacing: "0.2em", fontFamily: "'Orbitron', monospace",
    textShadow: "0 0 10px rgba(192,132,252,0.4)",
  },
  creditDot: { color: "#3a3a5a", fontSize: "0.82rem" },
  creditText: { color: "#606080", fontSize: "0.78rem", letterSpacing: "0.08em" },
  creditName: { color: "#c084fc", fontStyle: "normal", fontWeight: 700, letterSpacing: "0.12em", textShadow: "0 0 12px rgba(192,132,252,0.5)" },

  spinner: {
    width: 42, height: 42,
    border: "2px solid rgba(192,132,252,0.15)",
    borderTopColor: "#c084fc", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#a880cc", fontSize: "0.82rem", letterSpacing: "0.3em", margin: 0 },
};
