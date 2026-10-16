import React, { useState } from 'react';
import FloatingReactions from '../FloatingReactions';

const cleanVideoUrl = (url) => {
  if (!url) return '';
  let clean = url.trim();
  if (clean.startsWith('http://')) {
    clean = clean.replace('http://', 'https://');
  }
  if (clean.includes('cloudinary.com') && clean.includes('/video/upload/')) {
    // Inject Cloudinary fast-start progressive streaming & automatic quality/codec optimization
    if (!clean.includes('/q_auto') && !clean.includes('/vc_auto')) {
      clean = clean.replace('/video/upload/', '/video/upload/q_auto,f_auto/');
    }
    if (!clean.match(/\.(mp4|m4v|mov|webm|mkv|flv|avi)(\?.*)?$/i)) {
      clean = `${clean}.mp4`;
    }
  }
  return clean;
};

const WatchPlayer = ({ 
  video, 
  videoRef, 
  onPlay, 
  onPause, 
  onSeeked 
}) => {
  const [isBuffering, setIsBuffering] = useState(false);
  const videoSrc = cleanVideoUrl(video?.videoFile);

  return (
    <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl bg-black group">
      {videoSrc ? (
        <>
          <video 
            ref={videoRef}
            key={video._id + videoSrc}
            src={videoSrc}
            poster={video.thumbnail}
            controls
            autoPlay
            playsInline
            preload="auto"
            onPlay={(e) => {
              setIsBuffering(false);
              onPlay?.(e);
            }}
            onPause={onPause}
            onSeeked={onSeeked}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            className="w-full h-full object-contain bg-black"
          >
            Your browser does not support the video tag.
          </video>

          {/* Buffering Spinner Overlay */}
          {isBuffering && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-200">
              <div className="w-12 h-12 rounded-full border-4 border-[#FF0055] border-t-transparent animate-spin shadow-lg shadow-[#FF0055]/30" />
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950">
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className="w-full h-full object-cover filter brightness-75"
          />
        </div>
      )}

      {/* Floating Live Reactions Overlay */}
      {video._id && <FloatingReactions videoId={video._id} />}
    </div>
  );
};

export default WatchPlayer;

