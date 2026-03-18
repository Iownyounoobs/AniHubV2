import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { getMyList } from "../utils/firestoreUtils";

export default function MyList() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyList = async () => {
      try {
        const list = await getMyList();
        setAnimeList(list);
      } catch (err) {
        console.error("Failed to fetch My List:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyList();
  }, []);

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />
      <Navbar />

      <div style={s.container}>
        <div style={s.pageHeader}>
          <div style={s.accentBar} />
          <h1 style={s.pageTitle}>MY LIST</h1>
          <div style={s.headerLine} />
        </div>

        {loading ? (
          <div style={s.statusMsg}>LOADING YOUR LIST...</div>
        ) : animeList.length === 0 ? (
          <div style={s.emptyWrap}>
            <p style={s.emptyTitle}>// NO ENTRIES FOUND</p>
            <p style={s.emptySubtitle}>Browse anime and add your favorites to see them here.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {animeList.map((anime, index) => (
              <Card key={anime.id || index} anime={anime} />
            ))}
          </div>
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
  pageHeader: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" },
  accentBar: { width: 4, height: 28, borderRadius: 2, flexShrink: 0, background: "#fbbf24", boxShadow: "0 0 12px #fbbf24" },
  pageTitle: {
    fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.25em", margin: 0,
    color: "#fbbf24", textShadow: "0 0 18px #fbbf24", whiteSpace: "nowrap",
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
  },
  headerLine: { flex: 1, height: 1, opacity: 0.5, background: "linear-gradient(to right, rgba(251,191,36,0.4), transparent)" },
  statusMsg: { textAlign: "center", padding: "4rem 2rem", color: "#444", letterSpacing: "0.2em", fontSize: "0.85rem" },
  emptyWrap: { textAlign: "center", padding: "5rem 2rem" },
  emptyTitle: { color: "rgba(56,189,248,0.3)", fontSize: "0.9rem", letterSpacing: "0.2em", margin: "0 0 0.75rem" },
  emptySubtitle: { color: "#333", fontSize: "0.78rem", letterSpacing: "0.1em", margin: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "1.25rem",
  },
};
