import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../utils/firebase-config";

export default function Subscribe() {
  const [isNewUser, setIsNewUser] = useState(() => sessionStorage.getItem("anihub_new_user") === "1");

  const [alreadyPremium, setAlreadyPremium] = useState(false);
  const [subscriptionEnds, setSubscriptionEnds] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const checkIfPremium = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      const docSnap = await getDoc(doc(firestore, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isPremium) {
          setAlreadyPremium(true);
          sessionStorage.removeItem("anihub_new_user");
        }
        if (data.subscriptionEndsAt?.toDate) setSubscriptionEnds(data.subscriptionEndsAt.toDate());
        if (data.pendingCancellation) setCancelled(true);
      }
    };
    checkIfPremium();
  }, []);

  const handleSubscribe = async (plan) => {
    const user = getAuth().currentUser;
    if (!user) return alert("Please log in first");
    try {
      const res = await axios.post("http://localhost:3002/create-checkout-session", {
        uid: user.uid, plan,
      });
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout.");
    }
  };

  const handleCancelConfirm = async () => {
    const user = getAuth().currentUser;
    if (!user) return;
    setCancelling(true);
    try {
      await updateDoc(doc(firestore, "users", user.uid), { pendingCancellation: true });
      setCancelled(true);
      setShowCancelConfirm(false);
    } catch (err) {
      console.error("Cancel failed:", err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />
      <Navbar />

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div style={s.modalAccent} />
              <span style={s.modalTitle}>CANCEL SUBSCRIPTION</span>
            </div>
            <p style={s.modalBody}>Are you sure you want to cancel your subscription?</p>
            {subscriptionEnds ? (
              <p style={s.modalAccess}>
                Your premium access will continue until{" "}
                <span style={s.modalDate}>
                  {subscriptionEnds.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                . After that, you will lose access to premium features.
              </p>
            ) : (
              <p style={s.modalAccess}>
                Your premium access will remain active until the end of your current billing period.
                After that, you will lose access to premium features.
              </p>
            )}
            <div style={s.modalActions}>
              <button style={s.keepBtn} onClick={() => setShowCancelConfirm(false)}
                onMouseEnter={e => Object.assign(e.currentTarget.style, s.keepBtnHover)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, s.keepBtn)}>
                KEEP PREMIUM
              </button>
              <button style={s.confirmCancelBtn} onClick={handleCancelConfirm} disabled={cancelling}
                onMouseEnter={e => Object.assign(e.currentTarget.style, s.confirmCancelBtnHover)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, s.confirmCancelBtn)}>
                {cancelling ? "CANCELLING..." : "YES, CANCEL"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={s.container}>

        {/* ── New user gate hero ── */}
        {isNewUser && !alreadyPremium ? (
          <div style={s.gateHero}>
            <div style={s.gateGlow} />
            <p style={s.gateEyebrow}>ACCOUNT CREATED</p>
            <h1 style={s.gateHeading}>
              One step away from<br />
              <span style={s.gateHeadingCyan}>unlimited anime.</span>
            </h1>
            <p style={s.gateSubtext}>
              AniHub requires an active subscription to access content.<br />
              Choose a plan below and start watching instantly.
            </p>
            <div style={s.gatePills}>
              {[
                { icon: "▶", text: "Unlimited streaming" },
                { icon: "◈", text: "HD — no ads" },
                { icon: "⚡", text: "Early episode drops" },
                { icon: "✕", text: "Cancel anytime" },
              ].map(({ icon, text }) => (
                <div key={text} style={s.gatePill}>
                  <span style={s.gatePillIcon}>{icon}</span>
                  <span style={s.gatePillText}>{text}</span>
                </div>
              ))}
            </div>
            <div style={s.gateArrow}>↓ &nbsp;PICK YOUR PLAN</div>
          </div>
        ) : (
          <div style={s.pageHeader}>
            <div style={s.accentBar} />
            <h1 style={s.pageTitle}>PREMIUM ACCESS</h1>
            <div style={s.headerLine} />
          </div>
        )}

        {/* Status banners */}
        {cancelled ? (
          <div style={s.cancelledBanner}>
            <span style={s.cancelledDot} />
            <div>
              <p style={s.cancelledTitle}>SUBSCRIPTION CANCELLED</p>
              <p style={s.cancelledDesc}>
                {subscriptionEnds
                  ? `Your premium access continues until ${subscriptionEnds.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}. You won't be charged again.`
                  : "Your premium access will remain active until the end of your billing period. You won't be charged again."}
              </p>
            </div>
          </div>
        ) : alreadyPremium ? (
          <div style={s.premiumBanner}>
            <span style={s.premiumDot} />
            <div>
              <p style={s.premiumBannerTitle}>YOU ARE A PREMIUM MEMBER</p>
              {subscriptionEnds && (
                <p style={s.premiumBannerSub}>
                  Your subscription renews on {subscriptionEnds.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Plans */}
        <div style={s.plansRow}>
          {/* Monthly */}
          <div style={s.planCard}>
            <div style={s.planHeader}>
              <div style={{ ...s.planAccent, background: "#38bdf8", boxShadow: "0 0 12px #38bdf8" }} />
              <span style={{ ...s.planName, color: "#38bdf8" }}>MONTHLY</span>
            </div>
            <div style={s.planPrice}>
              <span style={s.priceAmount}>$5</span>
              <span style={s.pricePeriod}>/month</span>
            </div>
            <ul style={s.featureList}>
              {["Unlimited anime streaming", "High-definition quality", "Early episode access"].map(f => (
                <li key={f} style={s.featureItem}>
                  <span style={{ ...s.featureDot, background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              style={{ ...s.planBtn, color: "#38bdf8", borderColor: "rgba(56,189,248,0.5)" }}
              onClick={() => handleSubscribe("monthly")}
              onMouseEnter={e => Object.assign(e.currentTarget.style, { ...s.planBtnHover, background: "#38bdf8", borderColor: "#38bdf8" })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { ...s.planBtn, color: "#38bdf8", borderColor: "rgba(56,189,248,0.5)" })}
            >
              SUBSCRIBE MONTHLY
            </button>
          </div>

          {/* Yearly */}
          <div style={{ ...s.planCard, borderColor: "rgba(192,132,252,0.25)", background: "rgba(192,132,252,0.03)" }}>
            <div style={s.planHeader}>
              <div style={{ ...s.planAccent, background: "#c084fc", boxShadow: "0 0 12px #c084fc" }} />
              <span style={{ ...s.planName, color: "#c084fc" }}>YEARLY</span>
              <span style={s.bestValue}>BEST VALUE</span>
            </div>
            <div style={s.planPrice}>
              <span style={s.priceAmount}>$45</span>
              <span style={s.pricePeriod}>/year</span>
            </div>
            <ul style={s.featureList}>
              {["Everything in Monthly", "2 months free bonus", "Priority support"].map(f => (
                <li key={f} style={s.featureItem}>
                  <span style={{ ...s.featureDot, background: "#c084fc", boxShadow: "0 0 6px #c084fc" }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              style={{ ...s.planBtn, color: "#c084fc", borderColor: "rgba(192,132,252,0.5)" }}
              onClick={() => handleSubscribe("yearly")}
              onMouseEnter={e => Object.assign(e.currentTarget.style, { ...s.planBtnHover, background: "#c084fc", borderColor: "#c084fc" })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { ...s.planBtn, color: "#c084fc", borderColor: "rgba(192,132,252,0.5)" })}
            >
              SUBSCRIBE YEARLY
            </button>
          </div>
        </div>

        {/* Cancel section */}
        {alreadyPremium && !cancelled && (
          <div style={s.cancelSection}>
            <div style={s.cancelDivider} />
            <p style={s.cancelNote}>
              Want to stop your subscription? You'll keep access until the end of your billing period.
            </p>
            <button style={s.cancelBtn} onClick={() => setShowCancelConfirm(true)}
              onMouseEnter={e => Object.assign(e.currentTarget.style, s.cancelBtnHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, s.cancelBtn)}>
              CANCEL SUBSCRIPTION
            </button>
          </div>
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
    position: "relative", zIndex: 2, maxWidth: 900,
    margin: "0 auto", padding: "0 2rem 5rem", paddingTop: "7rem",
  },

  // Standard page header (non-new-user)
  pageHeader: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" },
  accentBar: { width: 4, height: 28, borderRadius: 2, flexShrink: 0, background: "#fbbf24", boxShadow: "0 0 12px #fbbf24" },
  pageTitle: {
    fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.25em", margin: 0,
    color: "#fbbf24", textShadow: "0 0 18px #fbbf24", whiteSpace: "nowrap",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
  },
  headerLine: { flex: 1, height: 1, opacity: 0.5, background: "linear-gradient(to right, rgba(251,191,36,0.4), transparent)" },

  // ── Gate hero ──
  gateHero: {
    position: "relative",
    textAlign: "center",
    padding: "3.5rem 2rem 3rem",
    marginBottom: "2.5rem",
    border: "1px solid rgba(56,189,248,0.15)",
    background: "rgba(56,189,248,0.02)",
    overflow: "hidden",
  },
  gateGlow: {
    position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)",
    width: "500px", height: "200px",
    background: "radial-gradient(ellipse, rgba(56,189,248,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  gateEyebrow: {
    color: "#38bdf8", fontSize: "0.95rem", fontWeight: 700,
    letterSpacing: "0.45em", margin: "0 0 1rem",
    fontFamily: "'Orbitron', monospace",
    textShadow: "0 0 16px rgba(56,189,248,0.5)",
  },
  gateHeading: {
    color: "#e8f4ff", fontSize: "2rem", fontWeight: 900,
    fontFamily: "'Orbitron', monospace", letterSpacing: "0.04em",
    lineHeight: 1.35, margin: "0 0 1.1rem",
  },
  gateHeadingCyan: {
    color: "#38bdf8",
    textShadow: "0 0 24px rgba(56,189,248,0.5)",
  },
  gateSubtext: {
    color: "#7aA0b8", fontSize: "0.9rem", lineHeight: 1.8,
    letterSpacing: "0.04em", margin: "0 auto 2rem",
    maxWidth: 520,
  },
  gatePills: {
    display: "flex", flexWrap: "wrap", justifyContent: "center",
    gap: "0.65rem", marginBottom: "2rem",
  },
  gatePill: {
    display: "flex", alignItems: "center", gap: "0.5rem",
    background: "rgba(56,189,248,0.07)",
    border: "1px solid rgba(56,189,248,0.2)",
    padding: "0.45rem 1rem",
    borderRadius: "2px",
  },
  gatePillIcon: { color: "#38bdf8", fontSize: "0.75rem" },
  gatePillText: { color: "#b8d8ec", fontSize: "0.8rem", letterSpacing: "0.08em", whiteSpace: "nowrap" },
  gateArrow: {
    color: "rgba(56,189,248,0.45)", fontSize: "0.72rem",
    letterSpacing: "0.3em", fontFamily: "'Orbitron', monospace",
  },

  // Status banners
  premiumBanner: {
    display: "flex", alignItems: "flex-start", gap: "0.9rem",
    background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.25)",
    padding: "1.1rem 1.4rem", marginBottom: "2rem",
  },
  premiumDot: { width: 8, height: 8, borderRadius: "50%", background: "#fbbf24", boxShadow: "0 0 10px #fbbf24", flexShrink: 0, marginTop: 4 },
  premiumBannerTitle: { color: "#fbbf24", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 0.3rem" },
  premiumBannerSub: { color: "#c8aa6e", fontSize: "0.78rem", letterSpacing: "0.06em", margin: 0 },

  cancelledBanner: {
    display: "flex", alignItems: "flex-start", gap: "0.9rem",
    background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.3)",
    padding: "1.1rem 1.4rem", marginBottom: "2rem",
  },
  cancelledDot: { width: 8, height: 8, borderRadius: "50%", background: "#94a3b8", flexShrink: 0, marginTop: 4 },
  cancelledTitle: { color: "#94a3b8", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 0.3rem" },
  cancelledDesc: { color: "#7a8fa0", fontSize: "0.78rem", letterSpacing: "0.04em", margin: 0, lineHeight: 1.6 },

  // Plan cards
  plansRow: { display: "flex", gap: "1.5rem", flexWrap: "wrap" },
  planCard: {
    flex: 1, minWidth: 260,
    background: "rgba(56,189,248,0.02)",
    border: "1px solid rgba(56,189,248,0.2)",
    padding: "2rem",
  },
  planHeader: { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" },
  planAccent: { width: 3, height: 18, borderRadius: 2 },
  planName: { fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.2em", fontFamily: "'Orbitron', monospace" },
  bestValue: {
    marginLeft: "auto", background: "rgba(192,132,252,0.1)",
    border: "1px solid rgba(192,132,252,0.4)", color: "#c084fc",
    fontSize: "0.6rem", letterSpacing: "0.2em", padding: "0.2rem 0.6rem",
  },
  planPrice: { display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "1.5rem" },
  priceAmount: { fontSize: "2.8rem", fontWeight: 900, color: "#fff", fontFamily: "'Orbitron', monospace", lineHeight: 1 },
  pricePeriod: { color: "#8aa4be", fontSize: "0.82rem", letterSpacing: "0.1em" },
  featureList: { listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  featureItem: { display: "flex", alignItems: "center", gap: "0.6rem", color: "#b8cfe0", fontSize: "0.84rem", letterSpacing: "0.06em" },
  featureDot: { width: 5, height: 5, borderRadius: "50%", flexShrink: 0 },
  planBtn: {
    background: "transparent", padding: "0.85rem", width: "100%",
    border: "1px solid", fontSize: "0.84rem", fontWeight: 700,
    letterSpacing: "0.2em", cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
  },
  planBtnHover: {
    color: "#000", padding: "0.85rem", width: "100%",
    fontSize: "0.84rem", fontWeight: 700, letterSpacing: "0.2em",
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
    boxShadow: "0 0 30px rgba(56,189,248,0.3)",
  },

  // Cancel section
  cancelSection: { marginTop: "3rem" },
  cancelDivider: { height: 1, background: "rgba(255,100,100,0.12)", marginBottom: "1.5rem" },
  cancelNote: { color: "#7a8fa0", fontSize: "0.82rem", letterSpacing: "0.05em", marginBottom: "1rem", lineHeight: 1.6 },
  cancelBtn: {
    background: "transparent", color: "#f87171",
    border: "1px solid rgba(248,113,113,0.3)", padding: "0.7rem 2rem",
    fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.2em",
    cursor: "pointer", transition: "all 0.2s", fontFamily: "'Share Tech Mono', monospace",
  },
  cancelBtnHover: {
    background: "rgba(248,113,113,0.08)", color: "#f87171",
    border: "1px solid rgba(248,113,113,0.6)",
    boxShadow: "0 0 14px rgba(248,113,113,0.12)", padding: "0.7rem 2rem",
    fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.2em",
    cursor: "pointer", transition: "all 0.2s", fontFamily: "'Share Tech Mono', monospace",
  },

  // Modal
  modalOverlay: {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem",
  },
  modal: {
    background: "#0a0a1f", border: "1px solid rgba(248,113,113,0.3)",
    maxWidth: 460, width: "100%", padding: "2rem",
    boxShadow: "0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(248,113,113,0.08)",
  },
  modalHeader: { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" },
  modalAccent: { width: 4, height: 20, borderRadius: 2, background: "#f87171", boxShadow: "0 0 10px #f8717166" },
  modalTitle: { color: "#f87171", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.2em", fontFamily: "'Orbitron', monospace" },
  modalBody: { color: "#c8dde8", fontSize: "0.9rem", letterSpacing: "0.05em", marginBottom: "0.75rem", lineHeight: 1.6 },
  modalAccess: { color: "#8aa4be", fontSize: "0.82rem", letterSpacing: "0.04em", lineHeight: 1.7, marginBottom: "1.75rem" },
  modalDate: { color: "#fbbf24", fontWeight: 700 },
  modalActions: { display: "flex", gap: "0.75rem" },
  keepBtn: {
    flex: 1, background: "rgba(56,189,248,0.08)", color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.4)", padding: "0.75rem",
    fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.15em",
    cursor: "pointer", transition: "all 0.2s", fontFamily: "'Share Tech Mono', monospace",
  },
  keepBtnHover: {
    flex: 1, background: "#38bdf8", color: "#000",
    border: "1px solid #38bdf8", boxShadow: "0 0 20px rgba(56,189,248,0.3)",
    padding: "0.75rem", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.15em",
    cursor: "pointer", transition: "all 0.2s", fontFamily: "'Share Tech Mono', monospace",
  },
  confirmCancelBtn: {
    flex: 1, background: "transparent", color: "#f87171",
    border: "1px solid rgba(248,113,113,0.4)", padding: "0.75rem",
    fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.15em",
    cursor: "pointer", transition: "all 0.2s", fontFamily: "'Share Tech Mono', monospace",
  },
  confirmCancelBtnHover: {
    flex: 1, background: "rgba(248,113,113,0.12)", color: "#f87171",
    border: "1px solid rgba(248,113,113,0.7)", boxShadow: "0 0 16px rgba(248,113,113,0.12)",
    padding: "0.75rem", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.15em",
    cursor: "pointer", transition: "all 0.2s", fontFamily: "'Share Tech Mono', monospace",
  },
};
