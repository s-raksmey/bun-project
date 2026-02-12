/**
 * Ultra Simple Audio Display Component
 * Matches native HTML5 audio player design
 */

'use client';

import React from 'react';
import { AudioDisplayProps } from '@/types/audio';

export const AudioDisplay: React.FC<AudioDisplayProps> = ({
  data,
  readOnly = false,
  onEdit,
  className = ''
}) => {
  const fileName = data.title || data.file?.title || data.file?.name || 'Audio File';

  return (
    <div className={`ultra-simple-audio ${className}`}>
      <audio 
        controls 
        src={data.url}
        preload="metadata"
        className="audio-player"
      >
        Your browser does not support the audio element.
      </audio>
      
      <div className="audio-filename">
        {fileName}
      </div>

      {!readOnly && onEdit && (
        <button
          type="button"
          className="replace-button"
          onClick={onEdit}
          aria-label="Replace audio"
        >
          Replace
        </button>
      )}
    </div>
  );
};

