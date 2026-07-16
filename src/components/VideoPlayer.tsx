/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Volume2, VolumeX, RotateCcw, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  thumbnailUrl?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  thumbnailUrl,
  autoplay = false,
  muted = false,
  controls = true,
  loop = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(muted);
  const [hasError, setHasError] = useState(false);

  // Helper to check if URL is an embed or direct video file
  const getEmbedInfo = (videoUrl: string) => {
    if (!videoUrl) return { type: 'placeholder' };

    // YouTube checks
    const ytMatch = videoUrl.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    if (ytMatch) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=${autoplay ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=${loop ? 1 : 0}&playlist=${ytMatch[1]}&controls=1&rel=0`,
      };
    }

    // Vimeo checks
    const vimeoMatch = videoUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=${autoplay ? 1 : 0}&muted=${isMuted ? 1 : 0}&loop=${loop ? 1 : 0}&background=0`,
      };
    }

    // Direct MP4 / WebM / Ogv or generic Vimeo external URLs
    const isDirect =
      videoUrl.includes('.mp4') ||
      videoUrl.includes('.webm') ||
      videoUrl.includes('.ogv') ||
      videoUrl.includes('player.vimeo.com/external');

    if (isDirect) {
      return { type: 'direct', embedUrl: videoUrl };
    }

    // Generic fallback: check if it contains embed
    if (videoUrl.includes('embed') || videoUrl.includes('player.')) {
      return { type: 'embed', embedUrl: videoUrl };
    }

    // Return as direct video fallback
    return { type: 'direct', embedUrl: videoUrl };
  };

  const info = getEmbedInfo(url);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  if (hasError) {
    return (
      <div className="w-full aspect-video bg-neutral-900 flex flex-col items-center justify-center text-neutral-400 p-6 rounded-lg border border-neutral-800" id="video-error-state">
        <AlertCircle className="w-12 h-12 text-accent-purple mb-3 animate-pulse" />
        <p className="text-sm font-medium text-neutral-200">Cinematic Stream Unavailable</p>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs text-center">
          The video format or external source could not be played directly. Please verify the URL.
        </p>
      </div>
    );
  }

  // Render direct MP4 / video files
  if (info.type === 'direct') {
    return (
      <div className="relative w-full h-full aspect-video group bg-black overflow-hidden rounded-lg border border-white/5" id="video-direct-container">
        {/* Thumbnail Preview prior to clicking play */}
        {!isPlaying && thumbnailUrl && (
          <div className="absolute inset-0 z-10 flex items-center justify-center transition-all duration-500">
            <img
              src={thumbnailUrl}
              alt="Video Thumbnail Preview"
              className="absolute inset-0 w-full h-full object-cover filter brightness-50 transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <button
              onClick={handlePlayClick}
              className="relative z-20 flex items-center justify-center w-16 h-16 rounded-full bg-accent-purple text-white shadow-lg shadow-accent-purple/30 hover:scale-110 active:scale-95 transition-all duration-300 hover:bg-opacity-90"
              aria-label="Play video"
              id="video-play-btn"
            >
              <Play className="w-6 h-6 fill-current ml-1" />
            </button>
          </div>
        )}

        <video
          src={info.embedUrl}
          className="w-full h-full object-cover aspect-video"
          autoPlay={autoplay || isPlaying}
          controls={controls && isPlaying}
          muted={isMuted}
          loop={loop}
          playsInline
          onError={() => setHasError(true)}
          id="direct-video-element"
        />

        {isPlaying && controls && (
          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full glass-card hover:border-accent-purple text-white transition-all"
              title={isMuted ? 'Unmute' : 'Mute'}
              id="video-mute-toggle"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-300" /> : <Volume2 className="w-4 h-4 text-accent-purple" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Render embedded frames (YouTube / Vimeo)
  if (info.type === 'youtube' || info.type === 'vimeo' || info.type === 'embed') {
    return (
      <div className="relative w-full aspect-video bg-black overflow-hidden rounded-lg border border-white/5 shadow-2xl" id="video-iframe-container">
        {!isPlaying && thumbnailUrl && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <img
              src={thumbnailUrl}
              alt="Video Embed Preview"
              className="absolute inset-0 w-full h-full object-cover filter brightness-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <button
              onClick={handlePlayClick}
              className="relative z-20 flex items-center justify-center w-16 h-16 rounded-full bg-accent-purple text-white shadow-lg shadow-accent-purple/30 hover:scale-110 active:scale-95 transition-all duration-300"
              aria-label="Play embed video"
              id="embed-play-btn"
            >
              <Play className="w-6 h-6 fill-current ml-1" />
            </button>
          </div>
        )}

        {/* Render iframe only when played or if autoplay is requested */}
        {(isPlaying || autoplay) ? (
          <iframe
            src={info.embedUrl}
            title="Cinematic Embed Player"
            className="w-full h-full border-0 absolute inset-0 aspect-video"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            id="video-iframe-element"
          />
        ) : (
          <div className="w-full h-full aspect-video bg-neutral-950 flex items-center justify-center text-neutral-500">
            <button
              onClick={handlePlayClick}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-accent-purple text-white shadow-lg shadow-accent-purple/30 hover:scale-110 transition-all duration-300"
            >
              <Play className="w-6 h-6 fill-current ml-1" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Fallback / Placeholder state
  return (
    <div className="w-full aspect-video bg-neutral-950 rounded-lg flex flex-col items-center justify-center text-neutral-500 border border-neutral-900" id="video-fallback-container">
      <Play className="w-12 h-12 text-neutral-800 animate-pulse mb-2" />
      <p className="text-xs">No active video link supplied.</p>
    </div>
  );
};
