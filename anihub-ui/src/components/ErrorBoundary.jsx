import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={s.page}>
          <div style={s.gridOverlay} />
          <div style={s.wrap}>
            <p style={s.code}>{"// ERROR"}</p>
            <h1 style={s.title}>Something went wrong.</h1>
            <p style={s.sub}>An unexpected error occurred. Please refresh the page.</p>
            <button style={s.btn} onClick={() => window.location.reload()}>
              RELOAD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const s = {
  page: {
    background: "#07071a", minHeight: "100vh", position: "relative",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Share Tech Mono','Courier New',monospace",
  },
  gridOverlay: {
    position: "fixed", inset: 0,
    backgroundImage: "linear-gradient(rgba(88,80,220,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(88,80,220,0.05) 1px,transparent 1px)",
    backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0,
  },
  wrap: {
    position: "relative", zIndex: 1, textAlign: "center",
    maxWidth: 480, padding: "2rem",
  },
  code: { color: "rgba(248,113,113,0.5)", fontSize: "0.7rem", letterSpacing: "0.4em", margin: "0 0 1rem" },
  title: {
    color: "#f87171", fontSize: "1.4rem", fontWeight: 900,
    fontFamily: "'Orbitron','Share Tech Mono',monospace",
    letterSpacing: "0.08em", margin: "0 0 1rem",
  },
  sub: { color: "#7a8fa0", fontSize: "0.85rem", letterSpacing: "0.06em", lineHeight: 1.7, margin: "0 0 2rem" },
  btn: {
    background: "transparent", color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.5)",
    padding: "0.75rem 2.5rem", fontSize: "0.85rem", fontWeight: 700,
    letterSpacing: "0.2em", cursor: "pointer",
    fontFamily: "'Orbitron','Share Tech Mono',monospace",
    clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
  },
};
