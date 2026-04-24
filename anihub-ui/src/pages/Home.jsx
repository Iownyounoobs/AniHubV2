import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

export default function Home() {
  const navigate = useNavigate();
  const [spotlight,    setSpotlight]    = useState([]);
  const [trending,     setTrending]     = useState([]);
  const [top10,        setTop10]        = useState([]);
  const [latest,       setLatest]       = useState([]);
  const [mostPopular,  setMostPopular]  = useState([]);
  const [mostFavorite, setMostFavorite] = useState([]);
  const [topUpcoming,  setTopUpcoming]  = useState([]);
  const [genres,       setGenres]       = useState([]);
  const [spotIndex,    setSpotIndex]    = useState(0);
  const [spotFade,     setSpotFade]     = useState(true);

  useEffect(() => {
    const API = process.env.REACT_APP_API_URL;
    // Homepage data (spotlight, top10)
    axios.get(`${API}/aniwatchtv`)
      .then(res => {
        setSpotlight(res.data.spotLightAnimes       || []);
        setTop10(    res.data.top10Animes?.day      || []);
        setGenres(   res.data.genres                || []);
      })
      .catch(err => console.error("Homepage fetch failed:", err.message));

    // Fetch 3 pages of top-airing for trending (~120 items)
    Promise.all([
      axios.get("${API}/aniwatchtv/top-airing?page=1"),
      axios.get("${API}/aniwatchtv/top-airing?page=2"),
      axios.get("${API}/aniwatchtv/top-airing?page=3"),
    ]).then(([p1, p2, p3]) => {
      const combined = [...(p1.data.animes||[]), ...(p2.data.animes||[]), ...(p3.data.animes||[])];
      const seen = new Set();
      setTrending(combined.filter(a => a.id && !seen.has(a.id) && seen.add(a.id)));
    }).catch(err => console.error("Trending fetch failed:", err.message));

    // Fetch 2 pages of top-upcoming (~80 items)
    Promise.all([
      axios.get("${API}/aniwatchtv/top-upcoming?page=1"),
      axios.get("${API}/aniwatchtv/top-upcoming?page=2"),
    ]).then(([p1, p2]) => {
      const combined = [...(p1.data.animes||[]), ...(p2.data.animes||[])];
      const seen = new Set();
      setTopUpcoming(combined.filter(a => a.id && !seen.has(a.id) && seen.add(a.id)));
    }).catch(err => console.error("Upcoming fetch failed:", err.message));

    // Fetch 3 pages of latest episodes (~72 items)
    Promise.all([
      axios.get("${API}/aniwatchtv/tv?page=1"),
      axios.get("${API}/aniwatchtv/tv?page=2"),
      axios.get("${API}/aniwatchtv/tv?page=3"),
    ]).then(([p1, p2, p3]) => {
      const combined = [
        ...(p1.data.animes || []),
        ...(p2.data.animes || []),
        ...(p3.data.animes || []),
      ];
      // dedupe by id
      const seen = new Set();
      setLatest(combined.filter(a => a.id && !seen.has(a.id) && seen.add(a.id)));
    }).catch(err => console.error("Latest fetch failed:", err.message));

    // Fetch 3 pages of most popular (~72 items)
    Promise.all([
      axios.get("${API}/aniwatchtv/most-popular?page=1"),
      axios.get("${API}/aniwatchtv/most-popular?page=2"),
      axios.get("${API}/aniwatchtv/most-popular?page=3"),
    ]).then(([p1, p2, p3]) => {
      const combined = [
        ...(p1.data.animes || []),
        ...(p2.data.animes || []),
        ...(p3.data.animes || []),
      ];
      const seen = new Set();
      setMostPopular(combined.filter(a => a.id && !seen.has(a.id) && seen.add(a.id)));
    }).catch(err => console.error("Most popular fetch failed:", err.message));

    // Fetch 2 pages of most favorite (~48 items)
    Promise.all([
      axios.get("${API}/aniwatchtv/most-favorite?page=1"),
      axios.get("${API}/aniwatchtv/most-favorite?page=2"),
    ]).then(([p1, p2]) => {
      const combined = [...(p1.data.animes || []), ...(p2.data.animes || [])];
      const seen = new Set();
      setMostFavorite(combined.filter(a => a.id && !seen.has(a.id) && seen.add(a.id)));
    }).catch(err => console.error("Most favorite fetch failed:", err.message));
  }, []);

  // Auto-cycle spotlight every 6s with fade
  useEffect(() => {
    if (spotlight.length < 2) return;
    const timer = setInterval(() => {
      setSpotFade(false);
      setTimeout(() => { setSpotIndex(i => (i + 1) % spotlight.length); setSpotFade(true); }, 300);
    }, 6000);
    return () => clearInterval(timer);
  }, [spotlight.length]);

  const switchSpot = (i) => {
    setSpotFade(false);
    setTimeout(() => { setSpotIndex(i); setSpotFade(true); }, 250);
  };

  const featured = spotlight[spotIndex];

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />
      <Navbar />

      {/* ────────── HERO SPOTLIGHT ────────── */}
      {featured && (
        <div style={{
          ...s.hero,
          backgroundImage: `
            linear-gradient(to right, rgba(7,7,26,0.98) 0%, rgba(7,7,26,0.88) 38%, rgba(7,7,26,0.45) 65%, rgba(7,7,26,0.05) 100%),
            linear-gradient(to top,   rgba(7,7,26,0.8)  0%, transparent 40%),
            url(${featured.img})
          `,
        }}>
          {/* Left content */}
          <div style={{ ...s.heroContent, opacity: spotFade ? 1 : 0, transition: "opacity 0.3s ease" }}>
            <div style={s.badgeRow}>
              <span style={s.badgeRank}>#{featured.rank}</span>
              {featured.category && <span style={s.badgeCat}>{featured.category}</span>}
              {featured.quality  && <span style={s.badgeHD}>{featured.quality}</span>}
            </div>

            <h1 style={s.heroTitle}>{featured.name}</h1>

            {featured.description && (
              <p style={s.heroDesc}>
                {featured.description.length > 220 ? featured.description.slice(0, 220) + "…" : featured.description}
              </p>
            )}

            <div style={s.heroMeta}>
              {featured.episodes?.sub != null && <span style={s.metaSub}>SUB {featured.episodes.sub}</span>}
              {featured.episodes?.dub != null && <span style={s.metaDub}>DUB {featured.episodes.dub}</span>}
              {featured.duration    && <span style={s.metaTxt}>{featured.duration}</span>}
              {featured.releasedDay && <span style={s.metaTxt}>{featured.releasedDay}</span>}
            </div>

            <div style={s.heroBtns}>
              <HBtn base={s.playBtn} hover={s.playBtnH} onClick={() => navigate(`/anime/${featured.id}`)}>
                ▶ &nbsp;WATCH NOW
              </HBtn>
              <HBtn base={s.listBtn} hover={s.listBtnH} onClick={() => navigate(`/anime/${featured.id}`)}>
                + &nbsp;MY LIST
              </HBtn>
            </div>
          </div>

          {/* Dot nav */}
          <div style={s.dots}>
            {spotlight.map((_, i) => (
              <button key={i} style={{ ...s.dot, ...(i === spotIndex ? s.dotOn : {}) }} onClick={() => switchSpot(i)} />
            ))}
          </div>
        </div>
      )}

      {/* ────────── GENRE STRIP ────────── */}
      {genres.length > 0 && (
        <div style={s.genreWrap}>
          <span style={s.genreLabel}>GENRES</span>
          <div style={s.genreTrack}>
            {genres.map(genre => (
              <button
                key={genre}
                style={s.genreChip}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(56,189,248,0.15)";
                  e.currentTarget.style.color = cyan;
                  e.currentTarget.style.borderColor = `${cyan}88`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.color = "#4a6070";
                  e.currentTarget.style.borderColor = "#1e2e3e";
                }}
                onClick={() => navigate(`/genre/${genre.toLowerCase()}`)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ────────── ORIGIN ────────── */}
      <div style={s.originRow}>
        <span style={s.originLabel}>BROWSE BY ORIGIN</span>
        <HBtn base={s.oBtnC} hover={s.oBtnCH} onClick={() => navigate("/origin/japan")}>◈ &nbsp;JAPAN</HBtn>
        <HBtn base={s.oBtnP} hover={s.oBtnPH} onClick={() => navigate("/origin/china")}>◈ &nbsp;CHINA</HBtn>
      </div>

      {/* ────────── SCROLL ROWS ────────── */}
      <div style={s.sections}>
        {trending.length     > 0 && <Row title="TRENDING NOW"          accent="#38bdf8" data={trending}     navigate={navigate} />}
        {top10.length        > 0 && <Row title="TOP 10 // TODAY"       accent="#c084fc" data={top10}        navigate={navigate} ranked />}
        {latest.length       > 0 && <Row title="LATEST DROPS"          accent="#fbbf24" data={latest}       navigate={navigate} seeAll={() => navigate("/tv")} />}
        {mostPopular.length  > 0 && <Row title="MOST POPULAR"          accent="#38bdf8" data={mostPopular}  navigate={navigate} />}
        {mostFavorite.length > 0 && <Row title="MOST FAVORITED"        accent="#c084fc" data={mostFavorite} navigate={navigate} />}
        {topUpcoming.length  > 0 && <Row title="COMING SOON"           accent="#fbbf24" data={topUpcoming}  navigate={navigate} comingSoon />}
      </div>

      {/* ────────── FOOTER ────────── */}
      <footer style={s.footer}>
        <div style={s.footerLine} />
        <div style={s.footerBrand}>
          <span style={s.footerLogo}>
            <span style={{ color: "#38bdf8", textShadow: "0 0 20px #38bdf8" }}>ANI</span><span style={{ color: "#c084fc", textShadow: "0 0 20px #c084fc" }}>HUB</span>
          </span>
        </div>
        <p style={s.footerDev}>Developed by <span style={s.footerName}>JimmieXiong</span></p>
        <div style={s.footerLine} />
      </footer>
    </div>
  );
}

/* ── Horizontal Scroll Row ── */
function Row({ title, accent, data, ranked = false, seeAll, navigate, comingSoon = false }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (dir > 0 && el.scrollLeft >= max - 10) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir < 0 && el.scrollLeft <= 10) {
      el.scrollTo({ left: max, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir * 700, behavior: "smooth" });
    }
  };

  return (
    <div style={s.rowWrap}>
      <div style={s.rowHead}>
        <div style={{ ...s.accentBar, background: accent, boxShadow: `0 0 8px ${accent}` }} />
        <h2 style={{ ...s.rowTitle, color: accent, textShadow: `0 0 10px ${accent}88` }}>{title}</h2>
        <div style={{ ...s.rowLine, background: `linear-gradient(to right, ${accent}44, transparent)` }} />
        {seeAll && (
          <button
            style={{ ...s.seeAllBtn, color: accent, borderColor: `${accent}55` }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = `${accent}55`)}
            onClick={seeAll}
          >
            SEE ALL ▶
          </button>
        )}
      </div>

      <div style={s.scrollOuter}>
        <button
          style={s.arrowBtn}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(56,189,248,0.15)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(56,189,248,0.05)")}
          onClick={() => scroll(-1)}
        >‹</button>

        <div ref={ref} style={s.scrollTrack}>
          {data.map((anime, i) => (
            <div key={anime.id || i} style={{ position: "relative", flexShrink: 0, width: 150 }}>
              {ranked && <div style={s.rankBadge}>{anime.rank ?? i + 1}</div>}
              <Card anime={anime} comingSoon={comingSoon} />
            </div>
          ))}
        </div>

        <button
          style={s.arrowBtn}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(56,189,248,0.15)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(56,189,248,0.05)")}
          onClick={() => scroll(1)}
        >›</button>
      </div>
    </div>
  );
}

/* ── Hover button helper ── */
function HBtn({ base, hover, onClick, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button style={hov ? hover : base} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}>
      {children}
    </button>
  );
}

/* ══════════════ STYLES ══════════════ */
const font  = "'Orbitron', 'Share Tech Mono', monospace";
const mono  = "'Share Tech Mono', 'Courier New', monospace";
const cyan  = "#38bdf8";
const pink  = "#c084fc";
const amber = "#fbbf24";

const btnBase = {
  fontFamily: font, fontWeight: 700, cursor: "pointer",
  fontSize: "0.8rem", letterSpacing: "0.18em",
  clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
  transition: "all 0.2s",
};

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

  /* Hero */
  hero: {
    position: "relative", zIndex: 2, marginTop: 80,
    height: "clamp(460px, 70vh, 700px)",
    backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat",
    display: "flex", alignItems: "flex-end",
  },
  heroContent: {
    position: "relative", zIndex: 3, maxWidth: 620,
    padding: "0 3.5rem 4rem",
    display: "flex", flexDirection: "column", gap: "1rem",
  },
  badgeRow: { display: "flex", alignItems: "center", gap: "0.6rem" },
  badgeRank: {
    background: cyan, color: "#000", fontFamily: font, fontWeight: 900,
    fontSize: "0.68rem", letterSpacing: "0.1em", padding: "3px 9px",
    clipPath: "polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)",
  },
  badgeCat: {
    color: cyan, border: `1px solid ${cyan}55`, fontSize: "0.62rem",
    fontFamily: font, letterSpacing: "0.18em", padding: "3px 10px",
  },
  badgeHD: {
    color: amber, border: `1px solid ${amber}55`, fontSize: "0.62rem",
    fontFamily: font, letterSpacing: "0.18em", padding: "3px 10px",
  },
  heroTitle: {
    fontFamily: font, fontWeight: 900, margin: 0,
    fontSize: "clamp(1.5rem, 3vw, 2.6rem)",
    letterSpacing: "0.04em", lineHeight: 1.1,
    color: "#fff", textShadow: "0 2px 24px rgba(0,0,0,0.9)",
  },
  heroDesc: {
    color: "#8faabe", fontSize: "0.83rem", lineHeight: 1.7,
    letterSpacing: "0.02em", margin: 0,
  },
  heroMeta: { display: "flex", alignItems: "center", gap: "0.7rem", flexWrap: "wrap" },
  metaSub: {
    background: "rgba(56,189,248,0.12)", color: cyan,
    border: `1px solid ${cyan}44`, fontSize: "0.65rem",
    fontFamily: font, letterSpacing: "0.12em", padding: "3px 9px",
  },
  metaDub: {
    background: "rgba(192,132,252,0.1)", color: pink,
    border: `1px solid ${pink}44`, fontSize: "0.65rem",
    fontFamily: font, letterSpacing: "0.12em", padding: "3px 9px",
  },
  metaTxt: { color: "#4a6070", fontSize: "0.7rem", letterSpacing: "0.1em" },
  heroBtns: { display: "flex", gap: "0.8rem", marginTop: "0.4rem" },
  playBtn: { ...btnBase, background: cyan, color: "#000", border: `1px solid ${cyan}`, padding: "0.68rem 1.8rem", boxShadow: `0 0 14px ${cyan}55` },
  playBtnH: { ...btnBase, background: "#fff", color: "#000", border: "1px solid #fff", padding: "0.68rem 1.8rem", boxShadow: "0 0 22px rgba(255,255,255,0.35)" },
  listBtn: { ...btnBase, background: `rgba(56,189,248,0.07)`, color: cyan, border: `1px solid ${cyan}44`, padding: "0.68rem 1.6rem" },
  listBtnH: { ...btnBase, background: `rgba(56,189,248,0.16)`, color: "#fff", border: `1px solid ${cyan}`, padding: "0.68rem 1.6rem", boxShadow: `0 0 12px ${cyan}44` },
  dots: { position: "absolute", bottom: "1.5rem", right: "3rem", display: "flex", gap: "0.5rem", zIndex: 4 },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" },
  dotOn: { width: 22, borderRadius: 3, background: cyan, boxShadow: `0 0 8px ${cyan}` },

  /* Origin */
  originRow: {
    position: "relative", zIndex: 2,
    display: "flex", alignItems: "center", gap: "1rem",
    padding: "1.5rem 3.5rem",
  },
  originLabel: { color: "#2e3e4e", fontSize: "0.62rem", letterSpacing: "0.4em", fontFamily: font, marginRight: "0.3rem" },
  oBtnC:  { ...btnBase, color: cyan, background: `rgba(56,189,248,0.06)`,   border: `1px solid ${cyan}44`, padding: "0.5rem 1.5rem", fontSize: "0.75rem" },
  oBtnCH: { ...btnBase, color: "#000", background: cyan,                     border: `1px solid ${cyan}`,   padding: "0.5rem 1.5rem", fontSize: "0.75rem", boxShadow: `0 0 18px ${cyan}66` },
  oBtnP:  { ...btnBase, color: pink, background: `rgba(192,132,252,0.06)`,   border: `1px solid ${pink}44`, padding: "0.5rem 1.5rem", fontSize: "0.75rem" },
  oBtnPH: { ...btnBase, color: "#000", background: pink,                     border: `1px solid ${pink}`,   padding: "0.5rem 1.5rem", fontSize: "0.75rem", boxShadow: `0 0 18px ${pink}66` },

  /* Sections */
  sections: { position: "relative", zIndex: 2, padding: "0 0 5rem" },
  rowWrap: { padding: "2.5rem 0 0.5rem" },
  rowHead: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", padding: "0 3.5rem" },
  accentBar: { width: 5, height: 24, borderRadius: 2, flexShrink: 0 },
  rowTitle: { fontFamily: font, fontSize: "1.05rem", fontWeight: 700, letterSpacing: "0.15em", margin: 0, whiteSpace: "nowrap" },
  rowLine: { flex: 1, height: 1 },
  seeAllBtn: {
    background: "transparent", fontFamily: mono,
    fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em",
    padding: "0.4rem 1rem", cursor: "pointer",
    border: "1px solid", transition: "border-color 0.2s", whiteSpace: "nowrap",
  },
  scrollOuter: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0 2.5rem" },
  arrowBtn: {
    background: "rgba(56,189,248,0.05)", color: cyan,
    border: `1px solid ${cyan}33`,
    width: 48, height: 48, flexShrink: 0, cursor: "pointer",
    fontSize: "2rem", lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.2s", borderRadius: 4, padding: 0,
  },
  scrollTrack: {
    display: "flex", gap: "1rem",
    overflowX: "auto",
    paddingTop: "0.5rem", paddingBottom: "2rem",
    scrollbarWidth: "none", msOverflowStyle: "none",
    flex: 1, minWidth: 0,
    alignItems: "flex-start",
  },
  rankBadge: {
    position: "absolute", top: 8, left: 8, zIndex: 5,
    background: "rgba(7,7,26,0.88)", color: pink,
    fontFamily: font, fontWeight: 900, fontSize: "0.72rem",
    padding: "3px 9px", border: `1px solid ${pink}55`,
    letterSpacing: "0.1em", backdropFilter: "blur(4px)",
    borderRadius: 3,
  },

  /* Genre strip */
  genreWrap: {
    position: "relative", zIndex: 2,
    display: "flex", alignItems: "center", gap: "1rem",
    padding: "1rem 3.5rem",
    borderBottom: "1px solid rgba(56,189,248,0.06)",
  },
  genreLabel: {
    color: "#2a3a4a", fontSize: "0.65rem", letterSpacing: "0.4em",
    fontFamily: font, flexShrink: 0,
  },
  genreTrack: {
    display: "flex", gap: "0.6rem",
    overflowX: "auto", scrollbarWidth: "none",
    msOverflowStyle: "none", flex: 1,
    paddingBottom: "4px",
  },
  genreChip: {
    background: "rgba(255,255,255,0.03)", color: "#5a7080",
    border: "1px solid #1e2e3e", fontFamily: mono,
    fontSize: "0.78rem", letterSpacing: "0.1em",
    padding: "0.5rem 1.1rem", cursor: "pointer",
    whiteSpace: "nowrap", flexShrink: 0,
    transition: "all 0.15s", borderRadius: 3,
  },

  /* Footer */
  footer: { position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", padding: "3.5rem 2rem" },
  footerLine: { width: "60%", height: 1, background: `linear-gradient(to right, transparent, ${cyan}33, ${pink}33, transparent)` },
  footerText: { color: "#253545", fontSize: "0.68rem", letterSpacing: "0.3em", margin: 0 },
  footerBrand: { display: "flex", alignItems: "center", gap: "0.75rem" },
  footerLogo: { fontFamily: font, fontWeight: 900, fontSize: "2.2rem", letterSpacing: "0.1em" },
  footerDivider: { color: "#2a3a4a", fontSize: "0.9rem" },
  footerDev: { color: "#6a8a9a", fontSize: "0.95rem", letterSpacing: "0.25em", fontFamily: font, margin: 0, textTransform: "uppercase" },
  footerName: { color: "#fff", letterSpacing: "0.15em", textShadow: `0 0 20px ${cyan}, 0 0 40px ${cyan}66` },
};
