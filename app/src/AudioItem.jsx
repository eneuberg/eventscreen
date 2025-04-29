import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';

export default function AudioItem({
  item,
  authorTag,
  onInteractionEnd,
  showToolbar,
}) {
  const containerRef = useRef(null);
  const wsRef        = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume]       = useState(1);

  // Initialize WaveSurfer once (or when item.src changes)
  useEffect(() => {
    if (!containerRef.current) return;
    const ws = WaveSurfer.create({
      container      : containerRef.current,
      waveColor      : 'rgba(255,255,255,0.7)',
      progressColor  : 'rgba(56,255,17,0.9)',
      backgroundColor: 'transparent',
      barWidth       : 2,
      height         : item.height,
      responsive     : true,
      normalize      : true,
    });
    ws.load(item.src);
    // When playback finishes, immediately start again
    ws.on('finish', () => {
      ws.play();
      setIsPlaying(true);
    });
    wsRef.current = ws;
    return () => ws.destroy();
  }, [item.src, item.height]);

  // Volume slider handler
  const handleVolumeChange = useCallback(
    e => {
      const v = Number(e.target.value);
      setVolume(v);
      wsRef.current?.setVolume(v);
    },
    []
  );

  // Play / pause on click
  const handlePlayClick = useCallback(
    e => {
      e.stopPropagation();
      const ws = wsRef.current;
      if (!ws) return;
      ws.playPause();
      setIsPlaying(ws.isPlaying());
      onInteractionEnd();
    },
    [onInteractionEnd]
  );

  return (
    <div
      className="relative w-full h-full select-none"
      onClick={handlePlayClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Author tag */}
      {authorTag}

      {/* Waveform */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Play icon overlay */}
      <div
        style={{
          position      : 'absolute',
          inset         : 0,
          display       : 'flex',
          alignItems    : 'center',
          justifyContent: 'center',
          fontSize      : '1.5rem',
          fontWeight    : 700,
          color         : '#38FF11',
          opacity       : isPlaying ? 0 : 0.8,
          pointerEvents : 'none',
        }}
      >
        ▶︎
      </div>

      {/* Vertical volume slider */}
      {showToolbar && (
        <div
          style={{
            position      : 'absolute',
            top           : 0,
            left          : '100%',
            width         : '30px',
            height        : '100%',
            background    : 'rgba(0,0,0,0.5)',
            display       : 'flex',
            alignItems    : 'center',
            justifyContent: 'center',
            pointerEvents : 'auto',
          }}
        >
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            style={{
              writingMode      : 'vertical-rl',
              WebkitAppearance : 'slider-vertical',
              transform        : 'rotate(180deg)',
              width            : '8px',
              height           : '80%',
              background       : 'transparent',
              cursor           : 'pointer',
              accentColor      : '#38FF11',
              border           : 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}
