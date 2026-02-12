/**
 * Simple Audio Display Component
 * Clean, minimal design with essential functionality only
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AudioDisplayProps } from '@/types/audio';

export const AudioDisplay: React.FC<AudioDisplayProps> = ({
  data,
  readOnly = false,
  onEdit,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const fileName = data.title || data.file?.title || data.file?.name || 'Audio File';

  return (
    <div className={`simple-audio ${className}`}>
      <audio ref={audioRef} src={data.url} preload="metadata" />
      
      <div className="audio-player">
        <button
          type="button"
          className="play-button"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <div className="audio-info">
          <span className="audio-name">{fileName}</span>
        </div>

        {!readOnly && onEdit && (
          <button
            type="button"
            className="edit-button"
            onClick={onEdit}
            aria-label="Replace audio"
          >
            ✏️
          </button>
        )}
      </div>
    </div>
  );
};
