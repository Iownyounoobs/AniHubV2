import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const pageParam = parseInt(searchParams.get("page")) || 1;

  const [results, setResults] = useState([]);
  const [page, setPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setPage(pageParam); }, [pageParam]);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    axios
      .get(`http://localhost:3001/aniwatchtv/search?keyword=${encodeURIComponent(query)}&page=${page}`)
      .then((res) => {
        setResults(res.data.animes || []);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch search results:", err.message);
        setLoading(false);
      });
  }, [query, page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ q: query, page: newPage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />
      <Navbar />
      <div style={s.container}>

        <div style={s.pageHeader}>
          <div style={s.accentBar} />
          <h1 style={s.pageTitle}>SEARCH // <span style={s.querySpan}>"{query}"</span></h1>
          <div style={s.headerLine} />
        </div>

        {loading && page === 1 ? (
          <div style={s.statusMsg}>SEARCHING...</div>
        ) : results.length === 0 ? (
          <div style={s.statusMsg}>NO RESULTS FOUND FOR "{query}"</div>
        ) : (
          <>
            <div style={s.grid}>
              {results.map((anime, index) => (
                <Card key={`${anime.id}-${index}`} anime={anime} />
              ))}
            </div>

            <div style={s.pagination}>
              <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} style={s.pageBtn}>‹</button>
              {[...Array(totalPages).keys()].slice(0, 5).map((i) => {
                const pg = i + 1;
                return (
                  <button key={pg} onClick={() => handlePageChange(pg)} style={pg === page ? s.pageBtnActive : s.pageBtn}>{pg}</button>
                );
              })}
              <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} style={s.pageBtn}>›</button>
            </div>
          </>
        )}
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
    position: "relative", zIndex: 2, maxWidth: 1400,
    margin: "0 auto", padding: "0 2rem 4rem", paddingTop: "8rem",
  },
  pageHeader: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem", flexWrap: "wrap" },
  accentBar: { width: 4, height: 28, borderRadius: 2, flexShrink: 0, background: "#38bdf8", boxShadow: "0 0 12px #38bdf8" },
  pageTitle: {
    fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.2em", margin: 0,
    color: "#38bdf8", textShadow: "0 0 18px #38bdf8",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
  },
  querySpan: { color: "#fff", textShadow: "none", letterSpacing: "0.05em" },
  headerLine: { flex: 1, height: 1, opacity: 0.5, background: "linear-gradient(to right, rgba(56,189,248,0.4), transparent)" },
  statusMsg: { textAlign: "center", padding: "4rem 2rem", color: "#444", letterSpacing: "0.2em", fontSize: "0.85rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: "2rem" },
  cardLink: { textDecoration: "none", color: "inherit" },
  card: { overflow: "hidden", cursor: "pointer", border: "1px solid rgba(56,189,248,0.12)", transition: "border-color 0.2s, box-shadow 0.2s" },
  cardHover: { overflow: "hidden", cursor: "pointer", border: "1px solid rgba(56,189,248,0.5)", boxShadow: "0 0 20px rgba(56,189,248,0.1)", transition: "border-color 0.2s, box-shadow 0.2s" },
  imageWrapper: { position: "relative", width: "100%", aspectRatio: "3 / 4" },
  image: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  titleOverlay: {
    position: "absolute", bottom: 0, width: "100%",
    background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
    padding: "1.5rem 0.6rem 0.6rem",
  },
  title: {
    fontSize: "0.72rem", margin: 0, color: "#ccc", letterSpacing: "0.04em", lineHeight: 1.3,
    overflow: "hidden", textOverflow: "ellipsis",
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", whiteSpace: "normal",
  },
  pagination: { marginTop: "3rem", display: "flex", justifyContent: "center", gap: "0.4rem", flexWrap: "wrap" },
  pageBtn: {
    background: "transparent", color: "#555", border: "1px solid rgba(56,189,248,0.2)",
    cursor: "pointer", minWidth: 38, height: 38, fontSize: "0.85rem", letterSpacing: "0.05em",
    fontFamily: "'Share Tech Mono', monospace", transition: "all 0.2s",
  },
  pageBtnActive: {
    background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.7)",
    boxShadow: "0 0 12px rgba(56,189,248,0.2)", cursor: "pointer", minWidth: 38, height: 38,
    fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em",
    fontFamily: "'Share Tech Mono', monospace", transition: "all 0.2s",
  },
};
