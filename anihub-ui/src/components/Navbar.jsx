import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaPowerOff, FaUserCircle } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  const handleNav = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { name: "HOME",    link: "/home" },
    { name: "LATEST",  link: "/tv" },
    { name: "MOVIES",  link: "/movies" },
    { name: "MY LIST", link: "/mylist" },
  ];

  return (
    <nav style={s.nav}>
      <div style={s.glowLine} />

      <div style={s.inner}>

        {/* ── Logo ── */}
        <Link to="/home" style={s.logoLink}>
          <span style={s.logoBracket}>[</span>
          <span style={s.logoAni}>ANI</span>
          <span style={s.logoHub}>HUB</span>
          <span style={s.logoBracket}>]</span>
        </Link>

        {/* ── Nav links ── */}
        <ul style={s.links}>
          {links.map(({ name, link }) => (
            <li key={name}>
              <Link
                to={link}
                style={s.linkAnchor}
                onMouseEnter={e => Object.assign(e.currentTarget.style, s.linkHover)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, s.linkAnchor)}
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Search ── */}
        <form onSubmit={handleSearchSubmit} style={s.searchForm}>
          <span style={s.searchIcon}>⌕</span>
          <input
            type="text"
            placeholder="Search anime..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={s.searchInput}
            onFocus={e => {
              e.currentTarget.parentElement.style.borderColor = "rgba(56,189,248,0.6)";
              e.currentTarget.parentElement.style.boxShadow = "0 0 16px rgba(56,189,248,0.15)";
              e.currentTarget.style.color = "#fff";
            }}
            onBlur={e => {
              e.currentTarget.parentElement.style.borderColor = "rgba(56,189,248,0.15)";
              e.currentTarget.parentElement.style.boxShadow = "none";
              e.currentTarget.style.color = "#8aa4be";
            }}
          />
        </form>

        {/* ── Right ── */}
        <div style={s.right}>

          {/* Profile */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(p => !p)}
              style={s.iconBtn}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(56,189,248,0.5)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            >
              <FaUserCircle style={s.profileIcon} />
            </button>

            {dropdownOpen && (
              <div style={s.dropdown}>
                <div style={s.dropdownHeader}>// USER MENU</div>
                {[
                  { label: "VIEW PROFILE",      path: "/profile" },
                  { label: "ACCOUNT SETTINGS",  path: "/change-account" },
                  { label: "SUBSCRIBE",         path: "/subscribe" },
                ].map(({ label, path }) => (
                  <button
                    key={path}
                    style={s.dropdownBtn}
                    onMouseEnter={e => Object.assign(e.currentTarget.style, s.dropdownBtnHover)}
                    onMouseLeave={e => Object.assign(e.currentTarget.style, s.dropdownBtn)}
                    onClick={() => handleNav(path)}
                  >
                    <span style={{ color: "rgba(56,189,248,0.5)" }}>▸</span> {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            style={s.powerBtn}
            title="Sign Out"
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(192,132,252,0.5)";
              e.currentTarget.style.boxShadow = "0 0 14px rgba(192,132,252,0.2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={() =>
              signOut(firebaseAuth)
                .then(() => navigate("/login"))
                .catch(err => console.error("Logout failed:", err.message))
            }
          >
            <FaPowerOff style={s.powerIcon} />
          </button>

        </div>
      </div>
    </nav>
  );
}

const s = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: "rgba(7, 7, 26, 0.94)",
    backdropFilter: "blur(18px)",
    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
  },

  // Cyan-to-magenta glow line at bottom
  glowLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: "linear-gradient(to right, transparent 0%, #38bdf8 30%, #c084fc 70%, transparent 100%)",
    opacity: 0.5,
  },

  inner: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "0 2.5rem",
    height: 80,
    display: "flex",
    alignItems: "center",
    gap: "2.5rem",
  },

  // Logo — large, Orbitron, cyan + magenta
  logoLink: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: 2,
    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
    fontSize: "1.65rem",
    fontWeight: 900,
    letterSpacing: "0.04em",
    flexShrink: 0,
  },
  logoBracket: {
    color: "rgba(56,189,248,0.25)",
    fontSize: "1.4rem",
  },
  logoAni: {
    color: "#38bdf8",
    textShadow: "0 0 18px #38bdf8, 0 0 40px #38bdf855",
  },
  logoHub: {
    color: "#c084fc",
    textShadow: "0 0 18px #c084fc, 0 0 40px #c084fc55",
  },

  // Nav links
  links: {
    listStyle: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    margin: 0,
    padding: 0,
    flexShrink: 0,
  },
  linkAnchor: {
    textDecoration: "none",
    color: "#666",
    fontSize: "0.88rem",
    fontWeight: 700,
    letterSpacing: "0.2em",
    padding: "0.5rem 1.1rem",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    display: "block",
  },
  linkHover: {
    textDecoration: "none",
    color: "#38bdf8",
    textShadow: "0 0 10px #38bdf8",
    fontSize: "0.88rem",
    fontWeight: 700,
    letterSpacing: "0.2em",
    padding: "0.5rem 1.1rem",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    display: "block",
  },

  // Search bar
  searchForm: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    maxWidth: 400,
    margin: "0 auto",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(56,189,248,0.15)",
    borderRadius: 3,
    padding: "0 1rem",
    gap: "0.6rem",
    height: 42,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  searchIcon: {
    color: "rgba(56,189,248,0.35)",
    fontSize: "1.3rem",
    flexShrink: 0,
    userSelect: "none",
    lineHeight: 1,
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#8aa4be",
    fontSize: "0.82rem",
    letterSpacing: "0.08em",
    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
  },

  // Right section
  right: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexShrink: 0,
  },

  // Profile button
  iconBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  profileIcon: {
    fontSize: "1.4rem",
    color: "#38bdf8",
  },

  // Power button
  powerBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  powerIcon: {
    fontSize: "1.1rem",
    color: "#c084fc",
  },

  // Dropdown
  dropdown: {
    position: "absolute",
    top: "calc(100% + 14px)",
    right: 0,
    background: "#0a0a1f",
    border: "1px solid rgba(56,189,248,0.25)",
    borderRadius: 6,
    minWidth: 240,
    boxShadow: "0 20px 60px rgba(0,0,0,0.85), 0 0 40px rgba(56,189,248,0.08)",
    zIndex: 9999,
    overflow: "hidden",
  },
  dropdownHeader: {
    color: "rgba(56,189,248,0.6)",
    fontSize: "0.72rem",
    letterSpacing: "0.3em",
    padding: "1rem 1.5rem 0.75rem",
    borderBottom: "1px solid rgba(56,189,248,0.1)",
    fontFamily: "'Orbitron', monospace",
  },
  dropdownBtn: {
    background: "none",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    width: "100%",
    textAlign: "left",
    color: "#c0d8e8",
    fontSize: "0.9rem",
    letterSpacing: "0.06em",
    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
    padding: "1rem 1.5rem",
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  dropdownBtnHover: {
    background: "rgba(56,189,248,0.08)",
    color: "#38bdf8",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    width: "100%",
    textAlign: "left",
    fontSize: "0.9rem",
    letterSpacing: "0.06em",
    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
    padding: "1rem 1.5rem",
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
};
