import React, { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';

/* ───────────────────────── STATIC MESSAGES ────────────────────────────── */
const feed = [
  { author: 'MC',      text: '+++ WELCOME TO THE EVENT +++' },
  { author: 'STAGE',   text: '+++ NEXT SPEAKER AT 11:00 +++' },
  { author: 'INFO',    text: '+++ SNACK BAR OPEN IN THE FOYER +++' },
  { author: 'SPONSOR', text: '+++ VISIT OUR SPONSORS’ BOOTHS +++' },
].map(o => ({ ...o, text: o.text.toUpperCase() }));

/* ────────────────────────── COMPONENT ─────────────────────────────────── */
export default function NewsTicker() {
  const [index, setIndex] = useState(0);        // which feed item
  const [cycleKey, setCycleKey] = useState(0);  // force re-mount for CSS
  const delayRef            = useRef(null);

  const current = feed[index];

  /* when one animation finishes … */
  const handleEnd = () => {
    if (index < feed.length - 1) {
      setIndex(i => i + 1);
      setCycleKey(k => k + 1);
    } else {
      // pause 3 s then restart
      delayRef.current = setTimeout(() => {
        setIndex(0);
        setCycleKey(k => k + 1);
      }, 3000);
    }
  };

  useEffect(() => () => clearTimeout(delayRef.current), []);

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <>
      <style>
        {`
          @keyframes slideLeft {
            from { transform: translateX(100vw); }
            to   { transform: translateX(-100%); }
          }
        `}
      </style>

      <Rnd
        default={{ x: 0, y: 0, width: '100vw', height: '12.5vh' }}
        dragAxis="y"
        enableResizing={false}
        bounds="window"
        style={{
          zIndex: 9999,
          pointerEvents: 'auto', // so the bar itself can be dragged
        }}
      >
        {/* BAR */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            userSelect: 'none',
          }}
        >
          {/* AUTHOR (static, small, left-aligned) */}
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '1rem',
              fontSize: 'clamp(12px, 2.2vh, 18px)',
              color: '#38FF11',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            {current.author}
          </div>

          {/* SCROLLING HEADLINE */}
          <span
            key={cycleKey}
            onAnimationEnd={handleEnd}
            style={{
              animation: 'slideLeft 12s linear forwards',
              whiteSpace: 'nowrap',
              fontWeight: 700,
              fontSize: 'clamp(16px, 5vh, 42px)',
              letterSpacing: '0.08em',
              paddingLeft: '100vw',        // start fully off-screen right
            }}
          >
            {current.text}
          </span>
        </div>
      </Rnd>
    </>
  );
}
