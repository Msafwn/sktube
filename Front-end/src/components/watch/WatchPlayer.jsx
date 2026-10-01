import React from 'react';
import FloatingReactions from '../FloatingReactions';

const cleanVideoUrl = (url) => {
  if (!url) return '';
  let clean = url.trim();
  if (clean.startsWith('http://')) {
    clean = clean.replace('http://', 'https://');
  }
  if (clean.includes('cloudinary.com') && clean.includes('/video/upload/')) {
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
  const videoSrc = cleanVideoUrl(video?.videoFile);

  return (
    <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl bg-black group">
      {videoSrc ? (
        <video 
          ref={videoRef}
          key={video._id + videoSrc}
          src={videoSrc}
          poster={video.thumbnail}
          controls
          autoPlay
          playsInline
          preload="auto"
          onPlay={onPlay}
          onPause={onPause}
          onSeeked={onSeeked}
          className="w-full h-full object-contain bg-black"
        >
          Your browser does not support the video tag.
        </video>
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

