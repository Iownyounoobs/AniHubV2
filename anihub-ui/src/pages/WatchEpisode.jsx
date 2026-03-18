import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function WatchEpisode() {
  const { episodeId } = useParams();
  const location = useLocation();

  const [embedUrl, setEmbedUrl] = useState(null);
  const [episodeNumber, setEpisodeNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setShowIframe(false);

        const searchParams = new URLSearchParams(location.search);
        const epId = searchParams.get("ep");
        const epNum = searchParams.get("epNum");

        if (epNum) setEpisodeNumber(epNum);

        if (!episodeId || !epId) {
          setError("Missing episode parameters");
          return;
        }

        const url = `http://localhost:3001/aniwatchtv/episode-srcs?id=${episodeId}?ep=${epId}&server=MegaCloud&category=sub`;
        const res = await axios.get(url);
        if (res.data?.embedUrl) setEmbedUrl(res.data.embedUrl);
      } catch (err) {
        console.error("Failed to fetch video source:", err);
        setError("Failed to load video. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [episodeId, location.search]);

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />
      <Navbar />

      <div style={s.container}>
        {/* Episode meta */}
        <div style={s.episodeMeta}>
          <div style={s.metaDot} />
          <span style={s.metaText}>
            {episodeId?.replace(/-/g, " ")}
            {episodeNumber ? ` — EP ${episodeNumber}` : ""}
          </span>
          {showIframe && embedUrl && (
            <button
              style={s.popoutBtn}
              onClick={() => window.open(embedUrl, "_blank")}
              title="Open in new tab"
            >
              ⤢
            </button>
          )}
        </div>

        {/* Player shell */}
        <div style={s.playerShell}>
          {isLoading ? (
            <div style={s.stateWrap}>
              <div style={s.spinner} />
              <span style={s.stateText}>LOADING EPISODE...</span>
            </div>

          ) : error ? (
            <div style={s.stateWrap}>
              <p style={s.errorText}>{error}</p>
              <button
                style={s.actionBtn}
                onClick={() => window.location.reload()}
                onMouseEnter={e => Object.assign(e.currentTarget.style, s.actionBtnHover)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, s.actionBtn)}
              >
                RETRY
              </button>
            </div>

          ) : embedUrl && showIframe ? (
            /* ── Inline iframe player ── */
            <iframe
              src={embedUrl}
              style={s.iframe}
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="no-referrer-when-downgrade"
              title="Episode Player"
            />

          ) : embedUrl ? (
            /* ── Play overlay ── */
            <div style={s.playOverlay} onClick={() => setShowIframe(true)}>
              {/* Radial glow backdrop */}
              <div style={s.overlayGlow} />

              {/* Play button */}
              <div
                style={s.playCircle}
                onMouseEnter={e => Object.assign(e.currentTarget.style, s.playCircleHover)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, s.playCircle)}
              >
                <div style={s.playRing} />
                <svg width="36" height="36" viewBox="0 0 24 24" fill="#38bdf8" style={{ marginLeft: 4 }}>
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>

              <p style={s.playLabel}>CLICK ANYWHERE TO PLAY</p>

              <button
                style={s.watchBtn}
                onMouseEnter={e => Object.assign(e.currentTarget.style, s.watchBtnHover)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, s.watchBtn)}
              >
                <span style={s.watchBtnIcon}>▶</span>
                WATCH NOW
              </button>
            </div>

          ) : (
            <div style={s.stateWrap}>
              <p style={s.stateText}>NO SOURCE AVAILABLE FOR THIS EPISODE.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
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
    position: "relative", zIndex: 2, maxWidth: 1000,
    margin: "0 auto", padding: "0 2rem 4rem", paddingTop: "8rem",
  },

  episodeMeta: {
    display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem",
  },
  metaDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#38bdf8", boxShadow: "0 0 8px #38bdf8", flexShrink: 0,
  },
  metaText: { color: "#666", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "capitalize", flex: 1 },
  popoutBtn: {
    background: "transparent", color: "#444",
    border: "1px solid rgba(255,255,255,0.08)",
    width: 30, height: 30, cursor: "pointer",
    fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "color 0.2s, border-color 0.2s",
  },

  playerShell: {
    width: "100%", aspectRatio: "16 / 9",
    background: "radial-gradient(ellipse at 15% 35%, rgba(88,80,220,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(56,189,248,0.08) 0%, transparent 45%), radial-gradient(ellipse at 55% 85%, rgba(192,132,252,0.1) 0%, transparent 50%), #07071a",
    border: "1px solid rgba(56,189,248,0.15)",
    boxShadow: "0 0 60px rgba(88,80,220,0.05)",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },

  iframe: {
    width: "100%", height: "100%",
    border: "none", display: "block",
  },

  stateWrap: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: "1.5rem", width: "100%", height: "100%",
  },
  spinner: {
    width: 32, height: 32,
    border: "2px solid rgba(56,189,248,0.15)",
    borderTopColor: "#38bdf8", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  stateText: { color: "#444", fontSize: "0.8rem", letterSpacing: "0.2em" },
  errorText: { color: "#ff6b6b", fontSize: "0.85rem", letterSpacing: "0.1em" },

  playOverlay: {
    position: "absolute", inset: 0,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: "1.75rem", cursor: "pointer",
  },
  overlayGlow: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at center, rgba(56,189,248,0.05) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  playCircle: {
    position: "relative",
    width: 96, height: 96, borderRadius: "50%",
    background: "rgba(56,189,248,0.07)",
    border: "2px solid rgba(56,189,248,0.5)",
    boxShadow: "0 0 30px rgba(56,189,248,0.12), inset 0 0 20px rgba(88,80,220,0.05)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.25s ease",
    zIndex: 1,
  },
  playCircleHover: {
    position: "relative",
    width: 96, height: 96, borderRadius: "50%",
    background: "rgba(56,189,248,0.18)",
    border: "2px solid #38bdf8",
    boxShadow: "0 0 50px rgba(56,189,248,0.35), 0 0 100px rgba(56,189,248,0.12), inset 0 0 30px rgba(56,189,248,0.08)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.25s ease", transform: "scale(1.08)",
    zIndex: 1,
  },
  playRing: {
    position: "absolute", inset: -8,
    borderRadius: "50%",
    border: "1px solid rgba(56,189,248,0.15)",
    animation: "pulseRing 2s ease-out infinite",
    pointerEvents: "none",
  },
  playLabel: {
    color: "rgba(56,189,248,0.35)", fontSize: "0.7rem",
    letterSpacing: "0.35em", margin: 0, zIndex: 1,
  },
  watchBtn: {
    background: "rgba(56,189,248,0.08)", color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.5)",
    boxShadow: "0 0 20px rgba(56,189,248,0.1)",
    padding: "0.8rem 3rem",
    fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.3em",
    cursor: "pointer", transition: "all 0.25s",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
    display: "flex", alignItems: "center", gap: "0.75rem", zIndex: 1,
  },
  watchBtnHover: {
    background: "#38bdf8", color: "#000",
    border: "1px solid #38bdf8",
    boxShadow: "0 0 40px rgba(56,189,248,0.5), 0 0 80px rgba(56,189,248,0.2)",
    padding: "0.8rem 3rem",
    fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.3em",
    cursor: "pointer", transition: "all 0.25s",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
    display: "flex", alignItems: "center", gap: "0.75rem", zIndex: 1,
    transform: "translateY(-1px)",
  },
  watchBtnIcon: { fontSize: "0.9rem" },

  actionBtn: {
    background: "transparent", color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.5)",
    padding: "0.65rem 2rem", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.2em",
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Share Tech Mono', monospace",
    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
  },
  actionBtnHover: {
    background: "#38bdf8", color: "#000",
    border: "1px solid #38bdf8", boxShadow: "0 0 24px rgba(56,189,248,0.4)",
    padding: "0.65rem 2rem", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.2em",
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Share Tech Mono', monospace",
    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
  },
};
