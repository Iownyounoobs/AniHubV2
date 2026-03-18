import React from "react";
import styled, { keyframes } from "styled-components";

export default function LoadingSpinner({ message = "INITIALIZING..." }) {
  return (
    <Overlay>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>

        {/* ── HUD Rings ── */}
        <HudWrap>
          <RingOuter />
          <RingMiddle />
          <RingInner />
          <CoreDot />
          <ScanBeam />

          {/* Corner brackets */}
          <Bracket style={{ top: 0, left: 0, borderTop: "2px solid #38bdf8", borderLeft: "2px solid #38bdf8" }} />
          <Bracket style={{ top: 0, right: 0, borderTop: "2px solid #38bdf8", borderRight: "2px solid #38bdf8" }} />
          <Bracket style={{ bottom: 0, left: 0, borderBottom: "2px solid #38bdf8", borderLeft: "2px solid #38bdf8" }} />
          <Bracket style={{ bottom: 0, right: 0, borderBottom: "2px solid #38bdf8", borderRight: "2px solid #38bdf8" }} />
        </HudWrap>

        {/* ── Logo ── */}
        <LogoRow>
          <span style={{ color: "#38bdf8", textShadow: "0 0 16px #38bdf8, 0 0 40px #38bdf844" }}>ANI</span>
          <span style={{ color: "#c084fc", textShadow: "0 0 16px #c084fc, 0 0 40px #c084fc44" }}>HUB</span>
        </LogoRow>

        {/* ── Message ── */}
        <MsgRow>
          <Cursor />
          <MsgText>{message}</MsgText>
        </MsgRow>

      </div>
    </Overlay>
  );
}

/* ── Keyframes ── */
const spinCW  = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const spinCCW = keyframes`from { transform: rotate(0deg); } to { transform: rotate(-360deg); }`;
const pulse   = keyframes`0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.6); }`;
const scan    = keyframes`0% { top: 10%; opacity: 0.8; } 100% { top: 90%; opacity: 0; }`;
const blink   = keyframes`0%,100% { opacity: 1; } 50% { opacity: 0; }`;
const glitch  = keyframes`
  0%,90%,100% { text-shadow: 0 0 8px #38bdf8; transform: none; }
  91% { text-shadow: -2px 0 #c084fc, 2px 0 #38bdf8; transform: translateX(2px); }
  93% { text-shadow: 2px 0 #c084fc, -2px 0 #38bdf8; transform: translateX(-2px); }
  95% { text-shadow: 0 0 8px #38bdf8; transform: none; }
`;

/* ── Styled Components ── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 40%, rgba(88,80,220,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, rgba(56,189,248,0.08) 0%, transparent 45%),
    radial-gradient(ellipse at 55% 85%, rgba(192,132,252,0.1) 0%, transparent 50%),
    #07071a;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  /* scanlines */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 2px,
      rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px
    );
    pointer-events: none;
  }

  /* grid */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(88,80,220,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(88,80,220,0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
`;

const HudWrap = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Bracket = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  opacity: 0.7;
`;

const RingOuter = styled.div`
  position: absolute;
  width: 154px;
  height: 154px;
  border-radius: 50%;
  border: 1.5px solid rgba(56,189,248,0.15);
  border-top: 2px solid #38bdf8;
  border-right: 2px solid rgba(56,189,248,0.4);
  animation: ${spinCW} 3s linear infinite;
  box-shadow: 0 0 12px rgba(56,189,248,0.2);
`;

const RingMiddle = styled.div`
  position: absolute;
  width: 116px;
  height: 116px;
  border-radius: 50%;
  border: 1.5px solid rgba(192,132,252,0.15);
  border-top: 2px solid rgba(192,132,252,0.3);
  border-left: 2px solid #c084fc;
  animation: ${spinCCW} 2s linear infinite;
  box-shadow: 0 0 10px rgba(192,132,252,0.15);
`;

const RingInner = styled.div`
  position: absolute;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  border: 1.5px solid rgba(56,189,248,0.1);
  border-bottom: 2px solid #38bdf8;
  border-right: 2px solid rgba(56,189,248,0.3);
  animation: ${spinCW} 1.2s linear infinite;
`;

const CoreDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8, 0 0 24px #38bdf8;
  animation: ${pulse} 1.5s ease-in-out infinite;
  position: absolute;
`;

const ScanBeam = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, transparent, #38bdf8, transparent);
  border-radius: 1px;
  animation: ${scan} 1.8s ease-in-out infinite;
`;

const LogoRow = styled.div`
  font-family: 'Orbitron', 'Share Tech Mono', monospace;
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: 0.12em;
`;

const MsgRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Cursor = styled.div`
  width: 8px;
  height: 14px;
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
  animation: ${blink} 1s step-start infinite;
  flex-shrink: 0;
`;

const MsgText = styled.p`
  margin: 0;
  font-family: 'Share Tech Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  color: #38bdf8;
  animation: ${glitch} 4s ease-in-out infinite;
`;
