import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const RANGE = 24; // episodes per tab

export default function AnimeDetails() {
  const { animeId } = useParams();
  const navigate    = useNavigate();

  const [animeDetails, setAnimeDetails] = useState(null);
  const [episodes,     setEpisodes]     = useState([]);
  const [epRange,      setEpRange]      = useState(0); // index of active range tab

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const API = process.env.REACT_APP_API_URL;
      const [detailsRes, episodesRes] = await Promise.all([
          axios.get(`${API}/aniwatchtv/anime/${animeId}`),
          axios.get(`${API}/aniwatchtv/episodes/${animeId}`),
        ]);
        setAnimeDetails(detailsRes.data);
        setEpisodes(episodesRes.data.episodes || []);
        setEpRange(0);
      } catch (err) {
        console.error("Error fetching anime data:", err);
      }
    };
    fetchDetails();
  }, [animeId]);

  // Split episodes into chunks of RANGE
  const epRanges = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < episodes.length; i += RANGE) {
      chunks.push(episodes.slice(i, i + RANGE));
    }
    return chunks;
  }, [episodes]);

  // Season links: related animes that share a common base name
  const seasons = useMemo(() => {
    if (!animeDetails) return [];
    const base = (animeDetails.info?.name || "")
      .replace(/(season\s*\d+|part\s*\d+|\d+(?:st|nd|rd|th)\s*season)/gi, "")
      .replace(/\s+/g, " ").trim().toLowerCase();
    const all = [
      ...(animeDetails.seasons || []),
      ...(animeDetails.relatedAnimes || []),
    ];
    const seen = new Set();
    return all.filter(a => {
      if (!a?.id || seen.has(a.id)) return false;
      seen.add(a.id);
      const n = (a.name || "").toLowerCase();
      return base.length > 3 && n.includes(base.slice(0, Math.min(base.length, 20)));
    });
  }, [animeDetails]);

  const uniqueRelated = useMemo(() => {
    if (!animeDetails) return [];
    const seen = new Set();
    return (animeDetails.relatedAnimes || []).filter(a => {
      if (!a?.id || seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [animeDetails]);

  if (!animeDetails) {
    return (
      <div style={s.page}>
        <div style={s.gridOverlay} />
        <Navbar />
        <div style={s.loadWrap}>
          <div style={s.ring} />
          <span style={s.loadTxt}>LOADING...</span>
        </div>
      </div>
    );
  }

  const { info, moreInfo = {} } = animeDetails;
  const currentChunk = epRanges[epRange] || [];

  return (
    <div style={s.page}>
      <div style={s.gridOverlay} />
      <div style={s.scanlines} />
      <Navbar />

      <div style={s.container}>

        {/* ── Banner ── */}
        <div style={s.banner}>
          <div style={s.posterWrap}>
            <img src={info?.img} alt={info?.name} style={s.poster} />
            <div style={s.posterShine} />
          </div>

          <div style={s.bannerInfo}>
            <div style={s.accentRow}>
              <div style={s.accentDot} />
              <span style={s.accentLabel}>ANIME DETAILS</span>
              {info?.category && <span style={s.catBadge}>{info.category}</span>}
              {info?.rating   && <span style={s.ratingBadge}>{info.rating}</span>}
            </div>

            <h1 style={s.title}>{info?.name || "Untitled"}</h1>

            {/* Quick stats row */}
            <div style={s.statsRow}>
              {moreInfo["MAL Score:"] && (
                <StatChip icon="★" label={moreInfo["MAL Score:"]} color="#fbbf24" />
              )}
              {info?.episodes?.sub != null && (
                <StatChip icon="▶" label={`SUB ${info.episodes.sub}`} color="#38bdf8" />
              )}
              {info?.episodes?.dub != null && (
                <StatChip icon="▶" label={`DUB ${info.episodes.dub}`} color="#c084fc" />
              )}
              {moreInfo["Duration:"] && (
                <StatChip icon="⏱" label={moreInfo["Duration:"]} color="#94a3b8" />
              )}
              {moreInfo["Status:"] && (
                <StatChip icon="◉" label={moreInfo["Status:"]} color={moreInfo["Status:"] === "Currently Airing" ? "#4ade80" : "#94a3b8"} />
              )}
            </div>

            <div style={s.divider} />
            <p style={s.desc}>{info?.description || "No description available."}</p>

            {/* Meta grid */}
            <div style={s.metaGrid}>
              {moreInfo["Aired:"]     && <MetaItem label="AIRED"    value={moreInfo["Aired:"]} />}
              {moreInfo["Premiered:"] && <MetaItem label="SEASON"   value={moreInfo["Premiered:"]} />}
              {moreInfo["Studios:"]   && <MetaItem label="STUDIO"   value={moreInfo["Studios:"]} />}
              {moreInfo["Genres"] && (
                <MetaItem label="GENRES" value={
                  <div style={s.genreTags}>
                    {(Array.isArray(moreInfo["Genres"]) ? moreInfo["Genres"] : [moreInfo["Genres"]]).map(g => (
                      <span
                        key={g} style={s.genreTag}
                        onClick={() => navigate(`/genre/${g.toLowerCase().replace(/\s+/g, "-")}`)}
                      >{g}</span>
                    ))}
                  </div>
                } />
              )}
            </div>
          </div>
        </div>

        {/* ── Season links ── */}
        {seasons.length > 0 && (
          <div style={s.section}>
            <SectionHead color="#fbbf24" title="SEASONS" />
            <div style={s.seasonRow}>
              {seasons.map(s2 => (
                <button
                  key={s2.id}
                  style={{ ...s.seasonBtn, ...(s2.id === animeId ? s.seasonBtnActive : {}) }}
                  onClick={() => navigate(`/anime/${s2.id}`)}
                >
                  {s2.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Episodes ── */}
        {episodes.length > 0 && (
          <div style={s.section}>
            <div style={s.epHeader}>
              <SectionHead color="#38bdf8" title="EPISODES" count={`${episodes.length} EPS`} />

              {/* Range tabs */}
              {epRanges.length > 1 && (
                <div style={s.rangeTabs}>
                  {epRanges.map((chunk, i) => {
                    const first = chunk[0]?.episodeNo ?? i * RANGE + 1;
                    const last  = chunk[chunk.length - 1]?.episodeNo ?? first + chunk.length - 1;
                    return (
                      <button
                        key={i}
                        style={{ ...s.rangeTab, ...(i === epRange ? s.rangeTabActive : {}) }}
                        onClick={() => setEpRange(i)}
                      >
                        {first}–{last}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={s.epGrid}>
              {currentChunk.map((ep, idx) => (
                <button
                  key={ep.episodeId || idx}
                  style={{ ...s.epCard, ...(ep.filler ? s.epCardFiller : {}) }}
                  onClick={() => navigate(`/watch/${ep.episodeId}&epNum=${ep.episodeNo ?? idx + 1}`)}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, ep.filler ? s.epCardFillerHover : s.epCardHover)}
                  onMouseLeave={e => Object.assign(e.currentTarget.style, ep.filler ? s.epCardFiller : s.epCard)}
                >
                  <span style={s.epNum}>{ep.episodeNo ?? idx + 1}</span>
                  <span style={s.epName}>{ep.name || `Episode ${ep.episodeNo ?? idx + 1}`}</span>
                  {ep.filler && <span style={s.fillerTag}>FILLER</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Related ── */}
        {uniqueRelated.length > 0 && (
          <div style={s.section}>
            <SectionHead color="#c084fc" title="RELATED" />
            <div style={s.relatedGrid}>
              {uniqueRelated.map(rel => (
                <a key={rel.id} href={`/anime/${rel.id}`} style={s.relCard}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, s.relCardHover)}
                  onMouseLeave={e => Object.assign(e.currentTarget.style, s.relCard)}
                >
                  <div style={s.relImgWrap}>
                    <img src={rel.img} alt={rel.name} style={s.relImg} />
                    <div style={s.relOverlay}>
                      <p style={s.relTitle}>{rel.name}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Small helper components ── */
function StatChip({ icon, label, color }) {
  return (
    <div style={{ ...s.statChip, borderColor: `${color}33`, color }}>
      <span>{icon}</span>
      <span style={{ color: "#e0eef8" }}>{label}</span>
    </div>
  );
}
function MetaItem({ label, value }) {
  return (
    <div style={s.metaItem}>
      <span style={s.metaLabel}>{label}</span>
      <span style={s.metaValue}>{value}</span>
    </div>
  );
}
function SectionHead({ color, title, count }) {
  return (
    <div style={s.sectionHead}>
      <div style={{ ...s.sectionBar, background: color, boxShadow: `0 0 12px ${color}` }} />
      <h2 style={{ ...s.sectionTitle, color, textShadow: `0 0 18px ${color}` }}>{title}</h2>
      <div style={{ ...s.sectionLine, background: `linear-gradient(to right, ${color}44, transparent)` }} />
      {count && <span style={s.sectionCount}>{count}</span>}
    </div>
  );
}

/* ── Styles ── */
const cyan  = "#38bdf8";
const pink  = "#c084fc";
const font  = "'Orbitron','Share Tech Mono',monospace";
const mono  = "'Share Tech Mono','Courier New',monospace";

const s = {
  page: {
    background: `radial-gradient(ellipse at 15% 35%,rgba(88,80,220,0.15) 0%,transparent 55%),
      radial-gradient(ellipse at 85% 15%,rgba(56,189,248,0.08) 0%,transparent 45%),
      radial-gradient(ellipse at 55% 85%,rgba(192,132,252,0.1) 0%,transparent 50%),#07071a`,
    minHeight: "100vh", position: "relative", overflowX: "hidden", fontFamily: mono,
  },
  gridOverlay: {
    position: "fixed", inset: 0,
    backgroundImage: `linear-gradient(rgba(88,80,220,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(88,80,220,0.04) 1px,transparent 1px)`,
    backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0,
  },
  scanlines: {
    position: "fixed", inset: 0,
    background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
    pointerEvents: "none", zIndex: 1,
  },
  container: { position: "relative", zIndex: 2, maxWidth: 1300, margin: "0 auto", padding: "0 2rem 5rem", paddingTop: "8rem" },

  loadWrap: { position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", minHeight: "80vh" },
  ring: { width: 52, height: 52, borderRadius: "50%", border: "2px solid rgba(56,189,248,0.12)", borderTop: `2px solid ${cyan}`, animation: "spin 1s linear infinite" },
  loadTxt: { color: cyan, fontSize: "0.72rem", letterSpacing: "0.35em" },

  /* Banner */
  banner: { display: "flex", gap: "2.5rem", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "3rem", padding: "2rem", background: "rgba(56,189,248,0.02)", border: "1px solid rgba(56,189,248,0.08)", borderRadius: 6 },
  posterWrap: { position: "relative", flexShrink: 0 },
  poster: { width: 185, display: "block", objectFit: "cover", borderRadius: 4 },
  posterShine: { position: "absolute", inset: 0, borderRadius: 4, boxShadow: "0 0 40px rgba(56,189,248,0.1) inset", pointerEvents: "none" },
  bannerInfo: { flex: 1, minWidth: 240 },
  accentRow: { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem", flexWrap: "wrap" },
  accentDot: { width: 7, height: 7, borderRadius: "50%", background: cyan, boxShadow: `0 0 10px ${cyan}` },
  accentLabel: { color: `${cyan}66`, fontSize: "0.62rem", letterSpacing: "0.35em", fontFamily: font },
  catBadge: { background: "rgba(56,189,248,0.1)", color: cyan, border: `1px solid ${cyan}33`, fontSize: "0.6rem", padding: "2px 8px", borderRadius: 2, fontFamily: font, letterSpacing: "0.1em" },
  ratingBadge: { background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)", fontSize: "0.6rem", padding: "2px 8px", borderRadius: 2, fontFamily: font, letterSpacing: "0.1em" },
  title: { fontSize: "clamp(1.3rem,3vw,2rem)", fontWeight: 900, margin: "0 0 1rem", color: "#f0f8ff", letterSpacing: "0.06em", lineHeight: 1.2, fontFamily: font },
  statsRow: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" },
  statChip: { display: "flex", alignItems: "center", gap: "0.4rem", padding: "4px 10px", border: "1px solid", borderRadius: 3, fontSize: "0.7rem", fontFamily: mono, letterSpacing: "0.06em" },
  divider: { width: 50, height: 2, background: `linear-gradient(to right,${cyan},transparent)`, marginBottom: "1rem" },
  desc: { color: "#b8cfe0", fontSize: "0.88rem", lineHeight: 1.8, margin: "0 0 1.5rem" },
  metaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.75rem" },
  metaItem: { display: "flex", flexDirection: "column", gap: "0.25rem" },
  metaLabel: { color: `${cyan}88`, fontSize: "0.6rem", letterSpacing: "0.3em", fontFamily: font },
  metaValue: { color: "#d0e4f0", fontSize: "0.82rem", letterSpacing: "0.04em" },
  genreTags: { display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.2rem" },
  genreTag: { background: "rgba(56,189,248,0.08)", color: cyan, border: `1px solid ${cyan}44`, fontSize: "0.68rem", padding: "3px 10px", borderRadius: 2, cursor: "pointer", letterSpacing: "0.06em", transition: "all 0.15s" },

  /* Season row */
  seasonRow: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  seasonBtn: { background: "transparent", color: "#90b0c8", border: "1px solid #2a3e50", fontFamily: mono, fontSize: "0.75rem", padding: "0.45rem 1rem", cursor: "pointer", borderRadius: 3, transition: "all 0.15s", letterSpacing: "0.06em" },
  seasonBtnActive: { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)" },

  /* Section */
  section: { marginTop: "3rem" },
  sectionHead: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" },
  sectionBar: { width: 4, height: 22, borderRadius: 2, flexShrink: 0 },
  sectionTitle: { fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.2em", margin: 0, whiteSpace: "nowrap", fontFamily: font },
  sectionLine: { flex: 1, height: 1 },
  sectionCount: { color: "#5a7a90", fontSize: "0.65rem", letterSpacing: "0.15em", flexShrink: 0 },

  /* Episode header */
  epHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" },
  rangeTabs: { display: "flex", gap: "0.4rem", flexWrap: "wrap" },
  rangeTab: { background: "transparent", color: "#7a9ab8", border: "1px solid #2a3a4a", fontFamily: mono, fontSize: "0.68rem", padding: "0.35rem 0.75rem", cursor: "pointer", borderRadius: 3, transition: "all 0.15s", letterSpacing: "0.06em" },
  rangeTabActive: { background: "rgba(56,189,248,0.1)", color: cyan, border: `1px solid ${cyan}44` },

  /* Episode grid */
  epGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "0.6rem" },
  epCard: {
    display: "flex", alignItems: "center", gap: "0.75rem",
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(56,189,248,0.1)",
    padding: "0.65rem 0.9rem", cursor: "pointer", borderRadius: 4,
    transition: "all 0.15s", textAlign: "left", width: "100%",
  },
  epCardHover: {
    background: "rgba(56,189,248,0.08)", border: `1px solid ${cyan}44`,
    boxShadow: `0 0 12px rgba(56,189,248,0.08)`,
    display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "0.65rem 0.9rem", cursor: "pointer", borderRadius: 4,
    transition: "all 0.15s", textAlign: "left", width: "100%",
  },
  epCardFiller: {
    display: "flex", alignItems: "center", gap: "0.75rem",
    background: "rgba(251,191,36,0.02)", border: "1px solid rgba(251,191,36,0.08)",
    padding: "0.65rem 0.9rem", cursor: "pointer", borderRadius: 4,
    transition: "all 0.15s", textAlign: "left", width: "100%",
  },
  epCardFillerHover: {
    background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.25)",
    display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "0.65rem 0.9rem", cursor: "pointer", borderRadius: 4,
    transition: "all 0.15s", textAlign: "left", width: "100%",
  },
  epNum: { color: cyan, fontFamily: font, fontSize: "0.72rem", fontWeight: 700, minWidth: 32, flexShrink: 0, letterSpacing: "0.05em" },
  epName: { color: "#cce0ee", fontSize: "0.82rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "0.02em" },
  fillerTag: { color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)", fontSize: "0.56rem", padding: "2px 6px", borderRadius: 2, fontFamily: font, flexShrink: 0, letterSpacing: "0.08em" },

  /* Related */
  relatedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "1.25rem" },
  relCard: { textDecoration: "none", color: "inherit", border: "1px solid rgba(192,132,252,0.1)", overflow: "hidden", display: "block", borderRadius: 4, transition: "border-color 0.2s,box-shadow 0.2s" },
  relCardHover: { textDecoration: "none", color: "inherit", border: "1px solid rgba(192,132,252,0.45)", boxShadow: "0 0 20px rgba(192,132,252,0.1)", overflow: "hidden", display: "block", borderRadius: 4, transition: "border-color 0.2s,box-shadow 0.2s" },
  relImgWrap: { position: "relative", width: "100%", aspectRatio: "2/3" },
  relImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  relOverlay: { position: "absolute", bottom: 0, width: "100%", background: "linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.5) 60%,transparent 100%)", padding: "1.5rem 0.5rem 0.5rem" },
  relTitle: { fontSize: "0.68rem", margin: 0, color: "#ccc", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", whiteSpace: "normal" },
};
