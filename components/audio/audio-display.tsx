/**
 * Audio Display Component
 * Displays audio files with player controls and metadata
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AudioDisplayProps } from '@/types/audio';
import { formatDuration, formatFileSize } from '@/types/audio';

export const AudioDisplay: React.FC<AudioDisplayProps> = ({
  data,
  readOnly = false,
  onEdit,
  className = '',
  config = {}
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [downloadStatus, setDownloadStatus] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const handleDownload = async () => {
    setDownloadStatus('Downloading...');
    
    try {
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.file?.name || data.title || 'audio-file';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatus('✅ Download started!');
      setTimeout(() => setDownloadStatus(''), 3000);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus('❌ Download failed');
      setTimeout(() => setDownloadStatus(''), 3000);
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`audio-display-container ${className}`}>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={data.url}
        preload={config.preload || 'metadata'}
        loop={config.loop || false}
        style={{ display: 'none' }}
      />

      {/* Audio Player Card */}
      <div className="audio-card">
        {/* Audio Info */}
        <div className="audio-info">
          <div className="audio-title">
            {data.title || data.file?.title || data.file?.name || 'Audio File'}
          </div>
          {(data.artist || data.file?.artist) && (
            <div className="audio-artist">
              {data.artist || data.file?.artist}
            </div>
          )}
          <div className="audio-meta">
            {data.file?.duration && (
              <span>Duration: {formatDuration(data.file.duration)}</span>
            )}
            {data.file?.size && (
              <span>Size: {formatFileSize(data.file.size)}</span>
            )}
            {data.file?.format && (
              <span>Format: {data.file.format.toUpperCase()}</span>
            )}
          </div>
        </div>

        {/* Player Controls */}
        {config.showControls !== false && (
          <div className="audio-controls">
            {/* Play/Pause Button */}
            <button
              type="button"
              className="audio-play-btn"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>

            {/* Progress Bar */}
            <div className="audio-progress-container">
              <input
                type="range"
                className="audio-progress-bar"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  background: `linear-gradient(to right, #007cba 0%, #007cba ${progressPercentage}%, #ddd ${progressPercentage}%, #ddd 100%)`
                }}
              />
              <div className="audio-time">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="audio-volume-container">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>}
                {volume > 0 && volume <= 0.5 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>}
              </svg>
              <input
                type="range"
                className="audio-volume-bar"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!readOnly && (
          <div className="audio-actions">
            <button
              type="button"
              className="audio-download-btn"
              onClick={handleDownload}
              disabled={downloadStatus === 'Downloading...'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {downloadStatus || 'Download'}
            </button>

            {onEdit && (
              <button
                type="button"
                className="audio-replace-btn"
                onClick={onEdit}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z"></path>
                  <polyline points="8 1 12 5 16 1"></polyline>
                </svg>
                Replace
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
