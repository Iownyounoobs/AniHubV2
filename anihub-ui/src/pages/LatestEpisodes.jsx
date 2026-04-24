import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

export default function LatestEpisodes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [episodes, setEpisodes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!searchParams.get("page")) setSearchParams({ page: "1" });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setLoading(true);
        setError("");
        const API = process.env.REACT_APP_API_URL;
        const res = await axios.get(`${API}/aniwatchtv/latest?page=${pageParam}`);
        const { latestEpisodes = [], totalPages = 1 } = res.data;
        setEpisodes(latestEpisodes);
        setTotalPages(totalPages);
      } catch (err) {
        console.error("Failed to fetch latest episodes:", err.message);
        setError("Failed to load episodes. Try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEpisodes();
  }, [pageParam]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(1, pageParam - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > totalPages) { end = totalPages; start = Math.max(1, end - maxVisible + 1); }
    return [...Array(end - start + 1).keys()].map((i) => start + i);
  };

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />
      <Navbar />
      <div style={s.container}>

        <div style={s.pageHeader}>
          <div style={s.accentBar} />
          <h1 style={s.pageTitle}>LATEST DROPS</h1>
          <div style={s.headerLine} />
        </div>

        {loading ? (
          <div style={s.statusMsg}>LOADING EPISODES...</div>
        ) : error ? (
          <div style={s.statusMsg}>{error}</div>
        ) : episodes.length === 0 ? (
          <div style={s.statusMsg}>NO EPISODES FOUND.</div>
        ) : (
          <>
            <div style={s.grid}>
              {episodes.map((anime, index) => (
                <Card key={anime.id || index} anime={anime} />
              ))}
            </div>

            <div style={s.pagination}>
              <button onClick={() => handlePageChange(1)} disabled={pageParam === 1} style={s.pageBtn}>«</button>
              <button onClick={() => handlePageChange(pageParam - 1)} disabled={pageParam === 1} style={s.pageBtn}>‹</button>
              {getVisiblePages().map((pg) => (
                <button
                  key={pg}
                  onClick={() => handlePageChange(pg)}
                  style={pg === pageParam ? s.pageBtnActive : s.pageBtn}
                >
                  {pg}
                </button>
              ))}
              <button onClick={() => handlePageChange(pageParam + 1)} disabled={pageParam === totalPages} style={s.pageBtn}>›</button>
              <button onClick={() => handlePageChange(totalPages)} disabled={pageParam === totalPages} style={s.pageBtn}>»</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    background: "radial-gradient(ellipse at 15% 35%, rgba(88,80,220,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(56,189,248,0.08) 0%, transparent 45%), radial-gradient(ellipse at 55% 85%, rgba(192,132,252,0.1) 0%, transparent 50%), #07071a",
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
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
    position: "relative", zIndex: 2,
    maxWidth: 1400, margin: "0 auto",
    padding: "0 2rem 4rem", paddingTop: "8rem",
  },
  pageHeader: {
    display: "flex", alignItems: "center", gap: "0.75rem",
    marginBottom: "2.5rem",
  },
  accentBar: {
    width: 4, height: 28, borderRadius: 2, flexShrink: 0,
    background: "#fbbf24", boxShadow: "0 0 12px #fbbf24",
  },
  pageTitle: {
    fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.25em",
    margin: 0, color: "#fbbf24",
    textShadow: "0 0 18px #fbbf24",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    whiteSpace: "nowrap",
  },
  headerLine: {
    flex: 1, height: 1, opacity: 0.5,
    background: "linear-gradient(to right, rgba(251,191,36,0.4), transparent)",
  },
  statusMsg: {
    textAlign: "center", padding: "4rem 2rem",
    color: "#444", letterSpacing: "0.2em", fontSize: "0.85rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))",
    gap: "2rem",
  },
  cardLink: { textDecoration: "none", color: "inherit" },
  card: {
    overflow: "hidden", cursor: "pointer",
    border: "1px solid rgba(56,189,248,0.12)",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  cardHover: {
    overflow: "hidden", cursor: "pointer",
    border: "1px solid rgba(56,189,248,0.5)",
    boxShadow: "0 0 20px rgba(56,189,248,0.1)",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  imageWrapper: { position: "relative", width: "100%", aspectRatio: "3 / 4" },
  image: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  titleOverlay: {
    position: "absolute", bottom: 0, width: "100%",
    background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
    padding: "1.5rem 0.6rem 0.6rem",
  },
  title: {
    fontSize: "0.72rem", margin: 0, color: "#ccc",
    letterSpacing: "0.04em", lineHeight: 1.3,
    overflow: "hidden", textOverflow: "ellipsis",
    display: "-webkit-box", WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical", whiteSpace: "normal",
  },
  pagination: {
    marginTop: "3rem", display: "flex",
    justifyContent: "center", gap: "0.4rem", flexWrap: "wrap",
  },
  pageBtn: {
    background: "transparent", color: "#555",
    border: "1px solid rgba(56,189,248,0.2)",
    cursor: "pointer", minWidth: 38, height: 38,
    fontSize: "0.85rem", letterSpacing: "0.05em",
    fontFamily: "'Share Tech Mono', monospace",
    transition: "all 0.2s",
  },
  pageBtnActive: {
    background: "rgba(56,189,248,0.1)", color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.7)",
    boxShadow: "0 0 12px rgba(56,189,248,0.2)",
    cursor: "pointer", minWidth: 38, height: 38,
    fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em",
    fontFamily: "'Share Tech Mono', monospace",
    transition: "all 0.2s",
  },
};
