import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styled, { keyframes } from "styled-components";
import { IoPlayCircleSharp } from "react-icons/io5";
import { AiOutlinePlus, AiOutlineCheck, AiOutlineBell } from "react-icons/ai";
import { MdClose } from "react-icons/md";
import { Link } from "react-router-dom";
import { addToMyList, removeFromMyList, isInMyList } from "../utils/firestoreUtils";

const POPUP_WIDTH  = 240;
const POPUP_HEIGHT = 480;
const NAVBAR_H     = 90;
const MARGIN       = 12;

export default function Card({ anime, comingSoon = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInList,  setIsInList]  = useState(false);
  const [popupStyle, setPopupStyle] = useState({});
  const [dir, setDir] = useState("up");
  const wrapRef    = useRef(null);
  const leaveTimer = useRef(null);

  const title    = anime.name?.trim() || anime.title?.trim() || "Untitled";
  const image    = anime.img || anime.image;
  const animeId  = anime.id || anime.slug || anime.animeId;
  const episode  = anime.episode && anime.episode !== "Unknown Ep" ? anime.episode : null;
  const subCount = anime.episodes?.sub  ?? null;
  const dubCount = anime.episodes?.dub  ?? null;
  const subOrDub = anime.subOrDub || null;

  useEffect(() => {
    isInMyList(animeId).then(setIsInList);
    return () => clearTimeout(leaveTimer.current);
  }, [animeId]);

  const handleAdd = async (e) => {
    e.stopPropagation(); e.preventDefault();
    await addToMyList(anime); setIsInList(true);
  };
  const handleRemove = async (e) => {
    e.stopPropagation(); e.preventDefault();
    await removeFromMyList(animeId); setIsInList(false);
  };

  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    if (wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;

      // clamp horizontally
      let left = cardCenterX - POPUP_WIDTH / 2;
      if (left < MARGIN) left = MARGIN;
      if (left + POPUP_WIDTH > window.innerWidth - MARGIN) {
        left = window.innerWidth - MARGIN - POPUP_WIDTH;
      }

      // center popup vertically over the card
      const cardCenterY = rect.top + window.scrollY + rect.height / 2;
      let top = cardCenterY - POPUP_HEIGHT / 2;

      // keep inside viewport
      const minTop = NAVBAR_H + window.scrollY + MARGIN;
      const maxTop = window.scrollY + window.innerHeight - POPUP_HEIGHT - MARGIN;
      if (top < minTop) top = minTop;
      if (top > maxTop) top = maxTop;

      setDir("up");
      setPopupStyle({ top, left });
    }
    setIsHovered(true);
  };

  const popup = isHovered && ReactDOM.createPortal(
    <HoverCard
      style={popupStyle}
      dir={dir}
      onMouseEnter={() => clearTimeout(leaveTimer.current)}
      onMouseLeave={() => { leaveTimer.current = setTimeout(() => setIsHovered(false), 180); }}
    >
      <HoverImg src={image} alt={title} />
      <HoverBody>
        <HoverTitle>{title}</HoverTitle>
        {(subCount != null || dubCount != null || subOrDub || episode) && (
          <HoverMeta>
            {subCount != null && <Badge type="sub">SUB {subCount}</Badge>}
            {dubCount != null && <Badge type="dub">DUB {dubCount}</Badge>}
            {subOrDub && !subCount && <Badge type="ep">{subOrDub}</Badge>}
            {episode  && <Badge type="ep">{episode}</Badge>}
          </HoverMeta>
        )}
        <HoverActions>
          {comingSoon ? (
            /* Coming Soon — no watch, just add to list */
            !isInList ? (
              <ActionBtn amber onClick={handleAdd} style={{ flex: 1, justifyContent: "center" }}>
                <AiOutlineBell />
                <span>INTERESTED</span>
              </ActionBtn>
            ) : (
              <>
                <ActionBtn green style={{ flex: 1, justifyContent: "center" }}>
                  <AiOutlineCheck />
                  <span>ON MY LIST</span>
                </ActionBtn>
                <ActionBtn red onClick={handleRemove}>
                  <MdClose />
                </ActionBtn>
              </>
            )
          ) : (
            /* Normal card */
            <>
              <Link to={`/anime/${animeId}`} style={{ textDecoration: "none", flex: 1 }}>
                <ActionBtn cyan>
                  <IoPlayCircleSharp />
                  <span>WATCH</span>
                </ActionBtn>
              </Link>
              {!isInList ? (
                <ActionBtn onClick={handleAdd}>
                  <AiOutlinePlus />
                  <span>LIST</span>
                </ActionBtn>
              ) : (
                <>
                  <ActionBtn green>
                    <AiOutlineCheck />
                  </ActionBtn>
                  <ActionBtn red onClick={handleRemove}>
                    <MdClose />
                  </ActionBtn>
                </>
              )}
            </>
          )}
        </HoverActions>
      </HoverBody>
    </HoverCard>,
    document.body
  );

  return (
    <>
      <Link to={`/anime/${animeId}`} style={{ textDecoration: "none", display: "block", width: "100%" }}>
        <Wrap
          ref={wrapRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => { leaveTimer.current = setTimeout(() => setIsHovered(false), 180); }}
          hovered={isHovered}
        >
          <PosterWrap>
            <img src={image} alt={title} />
            <PosterGradient />
            {isHovered && <PlayOverlay><IoPlayCircleSharp /></PlayOverlay>}
          </PosterWrap>
          <TitleBar>{title}</TitleBar>
          {(subCount != null || dubCount != null || episode) && (
            <Badges>
              {subCount != null && <Badge type="sub">SUB {subCount}</Badge>}
              {dubCount != null && <Badge type="dub">DUB {dubCount}</Badge>}
              {episode && !subCount && <Badge type="ep">{episode}</Badge>}
            </Badges>
          )}
        </Wrap>
      </Link>
      {popup}
    </>
  );
}

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(6px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);   }
`;
const fadeDown = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)     scale(1);   }
`;

const Wrap = styled.div`
  position: relative;
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;
  transform: ${p => p.hovered ? "scale(1.04)" : "scale(1)"};
`;

const PosterWrap = styled.div`
  position: relative;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  aspect-ratio: 2/3;
  background: #0d0d28;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: filter 0.25s ease;
  }

  ${Wrap}:hover & img {
    filter: brightness(0.72);
  }
`;

const PosterGradient = styled.div`
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 55%;
  background: linear-gradient(to top, rgba(7,7,26,0.9) 0%, transparent 100%);
  pointer-events: none;
`;

const PlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 3rem;
  filter: drop-shadow(0 2px 10px rgba(0,0,0,0.7));
  animation: ${fadeUp} 0.18s ease;
`;

const TitleBar = styled.div`
  font-size: 0.78rem;
  font-family: 'Share Tech Mono', monospace;
  margin-top: 0.45rem;
  color: #a0b8cc;
  line-height: 1.35;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: 0.02em;
`;

const Badges = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-top: 5px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  font-size: 0.56rem;
  font-family: 'Orbitron', monospace;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: 2px;
  color: ${p => p.type === "sub" ? "#38bdf8" : p.type === "dub" ? "#c084fc" : "#fbbf24"};
  border: 1px solid ${p => p.type === "sub" ? "rgba(56,189,248,0.3)" : p.type === "dub" ? "rgba(192,132,252,0.3)" : "rgba(251,191,36,0.3)"};
  background: ${p => p.type === "sub" ? "rgba(56,189,248,0.08)" : p.type === "dub" ? "rgba(192,132,252,0.08)" : "rgba(251,191,36,0.08)"};
`;

const HoverCard = styled.div`
  position: absolute;
  width: ${POPUP_WIDTH}px;
  max-height: 90vh;
  overflow-y: auto;
  background: #0e0e26;
  border: 1px solid rgba(56,189,248,0.2);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0,0,0,0.85), 0 0 0 1px rgba(56,189,248,0.05);
  z-index: 99999;
  animation: ${p => p.dir === "down" ? fadeDown : fadeUp} 0.2s ease forwards;
`;

const HoverImg = styled.img`
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  display: block;
`;

const HoverBody = styled.div`
  padding: 0.85rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const HoverTitle = styled.h3`
  margin: 0;
  font-size: 0.8rem;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #e8f4ff;
  letter-spacing: 0.03em;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const HoverMeta = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
`;

const HoverActions = styled.div`
  display: flex;
  gap: 0.45rem;
  margin-top: 0.15rem;
`;

const ActionBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: ${p => p.cyan ? 1 : "none"};
  padding: 0.45rem 0.85rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.68rem;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  letter-spacing: 0.1em;
  transition: all 0.15s ease;
  white-space: nowrap;

  background: ${p => p.cyan ? "rgba(56,189,248,0.15)" : p.green ? "rgba(74,222,128,0.12)" : p.red ? "rgba(248,113,113,0.12)" : p.amber ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.06)"};
  color: ${p => p.cyan ? "#38bdf8" : p.green ? "#4ade80" : p.red ? "#f87171" : p.amber ? "#fbbf24" : "#8aa4be"};
  border: 1px solid ${p => p.cyan ? "rgba(56,189,248,0.35)" : p.green ? "rgba(74,222,128,0.3)" : p.red ? "rgba(248,113,113,0.3)" : p.amber ? "rgba(251,191,36,0.35)" : "rgba(255,255,255,0.1)"};

  svg { font-size: 1rem; flex-shrink: 0; }

  &:hover {
    background: ${p => p.cyan ? "rgba(56,189,248,0.26)" : p.green ? "rgba(74,222,128,0.22)" : p.red ? "rgba(248,113,113,0.22)" : p.amber ? "rgba(251,191,36,0.22)" : "rgba(255,255,255,0.12)"};
  }
`;
