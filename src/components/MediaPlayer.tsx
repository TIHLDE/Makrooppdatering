'use client';

import { memo, useRef, useCallback } from 'react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  credit?: string;
  timeRangeSec?: { start: number; end: number } | null;
}

// Helper to detect YouTube URLs and extract video ID
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Clean up the URL first
  const cleanUrl = url.trim();
  
  // Pattern for youtube.com/watch?v=VIDEO_ID (flexible length for demo URLs)
  const watchPattern = /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/;
  // Pattern for youtu.be/VIDEO_ID  
  const shortPattern = /youtu\.be\/([a-zA-Z0-9_-]+)/;
  // Pattern for youtube.com/embed/VIDEO_ID
  const embedPattern = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/;
  
  let videoId = null;
  
  const watchMatch = cleanUrl.match(watchPattern);
  if (watchMatch) videoId = watchMatch[1];
  
  if (!videoId) {
    const shortMatch = cleanUrl.match(shortPattern);
    if (shortMatch) videoId = shortMatch[1];
  }
  
  if (!videoId) {
    const embedMatch = cleanUrl.match(embedPattern);
    if (embedMatch) videoId = embedMatch[1];
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

// Helper to check if URL is a YouTube URL (regardless of valid ID)
function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return /youtube\.com|youtu\.be/.test(url);
}

// Helper to get YouTube watch URL for linking
function getYouTubeWatchUrl(url: string): string | null {
  if (!url) return null;
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) return null;
  const videoId = embedUrl.split('/').pop();
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
}

// Helper to check if URL is a direct video file
function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url);
}

export const VideoPlayer = memo(function VideoPlayer({ 
  src, 
  title, 
  credit,
  timeRangeSec 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && timeRangeSec?.start) {
      videoRef.current.currentTime = timeRangeSec.start;
    }
  }, [timeRangeSec?.start]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && timeRangeSec?.end) {
      if (videoRef.current.currentTime >= timeRangeSec.end) {
        videoRef.current.pause();
        videoRef.current.currentTime = timeRangeSec.start || 0;
      }
    }
  }, [timeRangeSec?.start, timeRangeSec?.end]);

  // Check if it's a YouTube URL
  const youtubeEmbedUrl = getYouTubeEmbedUrl(src);
  
  if (youtubeEmbedUrl) {
    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="aspect-video bg-black">
          <iframe
            src={youtubeEmbedUrl}
            title={title || 'Video'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {(title || credit) && (
          <div className="p-3 bg-gray-800">
            {title && <p className="text-sm text-gray-300 font-medium">{title}</p>}
            {credit && <p className="text-xs text-gray-500 mt-1">{credit}</p>}
          </div>
        )}
      </div>
    );
  }

  // Check if it's a direct video file
  if (isDirectVideoUrl(src)) {
    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="aspect-video bg-black">
          <video
            ref={videoRef}
            src={src}
            title={title || 'Video'}
            controls
            className="w-full h-full"
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
          >
            Din nettleser støtter ikke video.
          </video>
        </div>
        {(title || credit || timeRangeSec) && (
          <div className="p-3 bg-gray-800">
            {title && <p className="text-sm text-gray-300 font-medium">{title}</p>}
            {timeRangeSec && (
              <p className="text-xs text-purple-400 mt-1">
                Klipp: {timeRangeSec.start}s - {timeRangeSec.end}s
              </p>
            )}
            {credit && <p className="text-xs text-gray-500 mt-1">{credit}</p>}
          </div>
        )}
      </div>
    );
  }

  // Fallback for unsupported URLs - show prominent YouTube link
  const youtubeWatchUrl = getYouTubeWatchUrl(src);
  const isYouTube = isYouTubeUrl(src);
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="aspect-video bg-gray-700 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-5xl mb-3">{isYouTube ? '📺' : '📹'}</div>
          <p className="text-base text-gray-300 font-medium mb-2">{title || 'Video'}</p>
          {timeRangeSec && (
            <p className="text-sm text-purple-400 mb-2">
              Klipp: {timeRangeSec.start}s - {timeRangeSec.end}s
            </p>
          )}
          <p className="text-sm text-gray-500 mb-4">
            {isYouTube 
              ? 'Videoen kan ikke vises direkte. Åpne på YouTube:' 
              : 'Videoformat ikke støttet'}
          </p>
          <a 
            href={youtubeWatchUrl || src} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            {isYouTube ? 'Åpne på YouTube' : 'Åpne video'}
          </a>
          <p className="text-xs text-gray-600 mt-3">
            {src.substring(0, 50)}{src.length > 50 ? '...' : ''}
          </p>
        </div>
      </div>
      {credit && (
        <div className="p-3 bg-gray-800 text-center border-t border-gray-700">
          <p className="text-xs text-gray-500">Kilde: {credit}</p>
        </div>
      )}
    </div>
  );
});

interface ImageDisplayProps {
  src: string;
  alt: string;
  title?: string;
  credit?: string;
}

export const ImageDisplay = memo(function ImageDisplay({ 
  src, 
  alt, 
  title,
  credit 
}: ImageDisplayProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="aspect-video bg-gray-700 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-contain"
        />
      </div>
      {(title || credit) && (
        <div className="p-3 bg-gray-800">
          {title && <p className="text-sm text-gray-300 font-medium">{title}</p>}
          {credit && <p className="text-xs text-gray-500 mt-1">{credit}</p>}
        </div>
      )}
    </div>
  );
});

interface ChartDisplayProps {
  title?: string;
  credit?: string;
}

export const ChartDisplay = memo(function ChartDisplay({ 
  title,
  credit 
}: ChartDisplayProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="aspect-video bg-gray-700 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm text-gray-400">{title || 'Chart'}</p>
        </div>
      </div>
      {credit && (
        <div className="p-3 bg-gray-800">
          <p className="text-xs text-gray-500">{credit}</p>
        </div>
      )}
    </div>
  );
});

interface MediaItem {
  mediaId?: string;
  type: 'image' | 'video' | 'audio' | 'article' | 'chart' | 'tweet' | 'pdf';
  title?: string;
  url: string;
  alt?: string;
  credit?: string;
  sourceId?: string;
  timeRangeSec?: { start: number; end: number } | null;
}

interface MediaRendererProps {
  media: MediaItem[];
}

export const MediaRenderer = memo(function MediaRenderer({ media }: MediaRendererProps) {
  if (!media || media.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {media.map((item, idx) => {
        const key = item.mediaId || `media-${idx}`;
        
        // Render video first if present
        if (item.type === 'video') {
          return (
            <VideoPlayer
              key={key}
              src={item.url}
              title={item.title}
              credit={item.credit}
              timeRangeSec={item.timeRangeSec}
            />
          );
        }
        
        // Then images
        if (item.type === 'image') {
          return (
            <ImageDisplay
              key={key}
              src={item.url}
              alt={item.alt || item.title || 'Image'}
              title={item.title}
              credit={item.credit}
            />
          );
        }
        
        // Charts
        if (item.type === 'chart') {
          return (
            <ChartDisplay
              key={key}
              title={item.title}
              credit={item.credit}
            />
          );
        }
        
        // Fallback for other types
        return (
          <div key={key} className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-700 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">
                  {item.type === 'audio' && '🎵'}
                  {item.type === 'article' && '📄'}
                  {item.type === 'tweet' && '🐦'}
                  {item.type === 'pdf' && '📑'}
                </div>
                <p className="text-sm text-gray-400">{item.title || item.type}</p>
              </div>
            </div>
            {item.credit && (
              <div className="p-3 bg-gray-800">
                <p className="text-xs text-gray-500">{item.credit}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
