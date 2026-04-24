import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

export default function Genre() {
  const { genre } = useParams();
  const navigate = useNavigate();
  const [animes, setAnimes]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setAnimes([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const API = process.env.REACT_APP_API_URL;
    axios
      .get(`${API}/aniwatchtv/genre/${encodeURIComponent(genre.toLowerCase())}?page=${page}`)
      .then(res => {
        setAnimes(res.data.animes || []);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Genre fetch failed:", err.message);
        setLoading(false);
      });
  }, [genre, page]);

  const displayName = genre.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />
      <Navbar />

      <div style={s.container}>

        {/* ── Header ── */}
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>← BACK</button>
          <div style={s.titleRow}>
            <div style={s.accentBar} />
            <h1 style={s.title}>{displayName}</h1>
            <span style={s.genreTag}># GENRE</span>
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div style={s.status}>
            <div style={s.ring} />
            <span style={s.statusTxt}>LOADING...</span>
          </div>
        ) : animes.length === 0 ? (
          <div style={s.status}>
            <span style={s.statusTxt}>NO RESULTS FOUND</span>
          </div>
        ) : (
          <div style={s.grid}>
            {animes.map((anime, i) => (
              <Card key={anime.id || i} anime={anime} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div style={s.pagination}>
            <button
              style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >◀ PREV</button>

            <div style={s.pageNumbers}>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = page <= 4
                  ? i + 1
                  : page >= totalPages - 3
                    ? totalPages - 6 + i
                    : page - 3 + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    style={{ ...s.pageNum, ...(p === page ? s.pageNumActive : {}) }}
                    onClick={() => setPage(p)}
                  >{p}</button>
                );
              })}
            </div>

            <button
              style={{ ...s.pageBtn, ...(page === totalPages ? s.pageBtnDisabled : {}) }}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >NEXT ▶</button>
          </div>
        )}

      </div>
    </div>
  );
}

const cyan  = "#38bdf8";
const font  = "'Orbitron', 'Share Tech Mono', monospace";
const mono  = "'Share Tech Mono', 'Courier New', monospace";

const s = {
  page: {
    background: `
      radial-gradient(ellipse at 15% 35%, rgba(88,80,220,0.15) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 15%, rgba(56,189,248,0.08) 0%, transparent 45%),
      radial-gradient(ellipse at 55% 85%, rgba(192,132,252,0.1) 0%, transparent 50%),
      #07071a
    `,
    minHeight: "100vh", position: "relative", overflowX: "hidden", fontFamily: mono,
  },
  gridOverlay: {
    position: "fixed", inset: 0,
    backgroundImage: `
      linear-gradient(rgba(88,80,220,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(88,80,220,0.05) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0,
  },
  scanlines: {
    position: "fixed", inset: 0,
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
    pointerEvents: "none", zIndex: 1,
  },
  container: {
    position: "relative", zIndex: 2,
    maxWidth: 1400, margin: "0 auto",
    padding: "0 2.5rem 5rem", paddingTop: "8rem",
  },

  /* Header */
  header: { marginBottom: "2.5rem" },
  backBtn: {
    background: "transparent", color: "#3a5060",
    border: "none", fontFamily: mono, fontSize: "0.72rem",
    letterSpacing: "0.2em", cursor: "pointer", padding: "0 0 1rem",
    transition: "color 0.2s",
  },
  titleRow: { display: "flex", alignItems: "center", gap: "1rem" },
  accentBar: {
    width: 5, height: 32, borderRadius: 2,
    background: cyan, boxShadow: `0 0 12px ${cyan}`,
    flexShrink: 0,
  },
  title: {
    fontFamily: font, fontWeight: 900, margin: 0,
    fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
    letterSpacing: "0.1em", color: "#e8f4ff",
    textShadow: `0 0 30px ${cyan}22`,
  },
  genreTag: {
    color: `${cyan}66`, fontFamily: font,
    fontSize: "0.65rem", letterSpacing: "0.3em",
    marginLeft: "0.5rem",
  },

  /* Status */
  status: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: "1.2rem", minHeight: "40vh",
  },
  ring: {
    width: 48, height: 48, borderRadius: "50%",
    border: `2px solid rgba(56,189,248,0.12)`,
    borderTop: `2px solid ${cyan}`,
    animation: "spin 1s linear infinite",
    boxShadow: `0 0 14px ${cyan}44`,
  },
  statusTxt: { color: cyan, fontSize: "0.72rem", letterSpacing: "0.35em" },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))",
    gap: "2rem",
  },

  /* Pagination */
  pagination: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "0.75rem", marginTop: "3rem", flexWrap: "wrap",
  },
  pageBtn: {
    background: "transparent", color: cyan,
    border: `1px solid ${cyan}44`, fontFamily: mono,
    fontSize: "0.7rem", letterSpacing: "0.2em",
    padding: "0.5rem 1.2rem", cursor: "pointer",
    clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
    transition: "all 0.2s",
  },
  pageBtnDisabled: { color: "#2a3a4a", borderColor: "#1a2a3a", cursor: "default" },
  pageNumbers: { display: "flex", gap: "0.4rem" },
  pageNum: {
    background: "transparent", color: "#4a6070",
    border: `1px solid #1e2e3e`, fontFamily: mono,
    fontSize: "0.72rem", width: 36, height: 36,
    cursor: "pointer", transition: "all 0.2s",
  },
  pageNumActive: {
    background: `rgba(56,189,248,0.12)`, color: cyan,
    border: `1px solid ${cyan}66`,
    boxShadow: `0 0 10px ${cyan}22`,
  },
};
