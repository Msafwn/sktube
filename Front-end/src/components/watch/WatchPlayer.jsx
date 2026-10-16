import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw, 
  Settings, 
  Check 
} from 'lucide-react';
import FloatingReactions from '../FloatingReactions';

// Ensure HTTPS and inject Cloudinary fast-start progressive streaming & codec optimization
const cleanVideoUrl = (url) => {
  if (!url) return '';
  let clean = url.trim();
  if (clean.startsWith('http://')) {
    clean = clean.replace('http://', 'https://');
  }
  if (clean.includes('cloudinary.com') && clean.includes('/video/upload/')) {
    if (!clean.includes('/q_auto') && !clean.includes('/vc_auto')) {
      clean = clean.replace('/video/upload/', '/video/upload/q_auto,f_auto/');
    }
    if (!clean.match(/\.(mp4|m4v|mov|webm|mkv|flv|avi)(\?.*)?$/i)) {
      clean = `${clean}.mp4`;
    }
  }
  return clean;
};

// Monospace/Clean Duration & Time Formatter (HH:MM:SS or MM:SS)
const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds === null || timeInSeconds < 0) return '0:00';
  const total = Math.floor(timeInSeconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const WatchPlayer = ({ 
  video, 
  videoRef, 
  onPlay, 
  onPause, 
  onSeeked 
}) => {
  const containerRef = useRef(null);
  const progressTrackRef = useRef(null);
  const hideControlsTimerRef = useRef(null);
  const clickTimerRef = useRef(null);

  // Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video?.duration || 0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  
  // Volume & Audio States
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);

  // UI & Overlay Controls
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [quickSeekRipple, setQuickSeekRipple] = useState(null); // 'left' | 'right'

  const videoSrc = cleanVideoUrl(video?.videoFile);

  // Sync initial and video prop duration changes
  useEffect(() => {
    if (video?.duration && !duration) {
      setDuration(video.duration);
    }
  }, [video?.duration, duration]);

  // Handle Fullscreen Change Detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Controls Auto-Hide Behavior (Fade out after 2.5s of mouse inactivity during playback)
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying && !isScrubbing && !showSpeedMenu) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, isScrubbing, showSpeedMenu]);

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  const handleMouseLeave = () => {
    if (isPlaying && !isScrubbing && !showSpeedMenu) {
      setShowControls(false);
    }
  };

  // Play / Pause Toggle
  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [videoRef]);

  // Zero-Reload Relative Seeking (Instant Memory Seek without server hit)
  const seekRelative = useCallback((secondsDelta) => {
    const el = videoRef.current;
    if (!el) return;
    const newTime = Math.max(0, Math.min(el.currentTime + secondsDelta, el.duration || duration || 0));
    el.currentTime = newTime;
    setCurrentTime(newTime);
    onSeeked?.();

    // Trigger visual ripple indicator
    setQuickSeekRipple(secondsDelta < 0 ? 'left' : 'right');
    setTimeout(() => setQuickSeekRipple(null), 600);
  }, [videoRef, duration, onSeeked]);

  // Absolute Seek (Scrubbing / Clicking progress bar)
  const seekTo = useCallback((targetTime) => {
    const el = videoRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(targetTime, el.duration || duration || 0));
    el.currentTime = clamped;
    setCurrentTime(clamped);
    onSeeked?.();
  }, [videoRef, duration, onSeeked]);

  // Volume Handlers
  const handleVolumeChange = (newVol) => {
    const el = videoRef.current;
    const clamped = Math.max(0, Math.min(newVol, 1));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    if (el) {
      el.volume = clamped;
      el.muted = clamped === 0;
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    if (isMuted || volume === 0) {
      const restored = prevVolume > 0 ? prevVolume : 1;
      setVolume(restored);
      setIsMuted(false);
      el.volume = restored;
      el.muted = false;
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
      el.volume = 0;
      el.muted = true;
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Playback Speed Change
  const handleSpeedChange = (rate) => {
    setPlaybackSpeed(rate);
    setShowSpeedMenu(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Accurate Buffer Tracking (Finds contiguous buffered range ahead of current playback)
  const updateBuffer = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.duration || el.duration <= 0) return;
    const cur = el.currentTime;
    const dur = el.duration;
    const buffered = el.buffered;

    let targetEnd = 0;
    for (let i = 0; i < buffered.length; i++) {
      if (buffered.start(i) <= cur && cur <= buffered.end(i)) {
        targetEnd = buffered.end(i);
        break;
      }
    }
    // Fallback to highest buffered end if not strictly intersecting
    if (targetEnd === 0 && buffered.length > 0) {
      targetEnd = buffered.end(buffered.length - 1);
    }
    setBufferedPercent(Math.min(100, (targetEnd / dur) * 100));
  }, [videoRef]);

  // Time & Buffer Update Event Listener
  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el || isScrubbing) return;
    setCurrentTime(el.currentTime);
    updateBuffer();
  };

  // Progress Bar Mouse / Drag Scrubbing Calculations
  const calculateScrubTime = useCallback((clientX) => {
    if (!progressTrackRef.current) return 0;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = pos / rect.width;
    const targetDur = videoRef.current?.duration || duration || 0;
    return percent * targetDur;
  }, [videoRef, duration]);

  const handleScrubMouseDown = (e) => {
    e.preventDefault();
    setIsScrubbing(true);
    const newTime = calculateScrubTime(e.clientX);
    seekTo(newTime);

    const onMouseMove = (moveEvent) => {
      const scrubTime = calculateScrubTime(moveEvent.clientX);
      seekTo(scrubTime);
    };

    const onMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Hover Tooltip Position on Progress Bar
  const handleTrackMouseMove = (e) => {
    if (!progressTrackRef.current) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = pos / rect.width;
    const targetDur = videoRef.current?.duration || duration || 0;
    setHoverPosition(percent * 100);
    setHoverTime(percent * targetDur);
  };

  const handleTrackMouseLeave = () => {
    setHoverTime(null);
  };

  // Video Screen Single Click (Play/Pause) vs Double Click (Seek -10s / +10s)
  const handleVideoClick = (e) => {
    // If clicking on controls, ignore
    if (e.target.closest('.player-controls-container')) return;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      // Double Click: Check if click was on left or right half
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width * 0.4) {
        seekRelative(-10);
      } else if (clickX > rect.width * 0.6) {
        seekRelative(+10);
      } else {
        togglePlay();
      }
    } else {
      clickTimerRef.current = setTimeout(() => {
        togglePlay();
        clickTimerRef.current = null;
      }, 250);
    }
  };

  // Keyboard Shortcuts (Space, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, M, F)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in comment/search input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
        case 'J':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'ArrowRight':
        case 'l':
        case 'L':
          e.preventDefault();
          seekRelative(+10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, seekRelative, volume]);

  const effectiveDuration = duration || videoRef.current?.duration || 0;
  const playedPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl bg-black group select-none cursor-pointer"
      onClick={handleVideoClick}
    >
      {videoSrc ? (
        <>
          {/* Main Video Element (Stable node: retains in-memory buffer without re-fetching on seeks) */}
          <video 
            ref={videoRef}
            src={videoSrc}
            poster={video?.thumbnail}
            playsInline
            preload="auto"
            autoPlay
            onLoadedMetadata={() => {
              if (videoRef.current?.duration) {
                setDuration(videoRef.current.duration);
              }
              setIsBuffering(false);
            }}
            onTimeUpdate={handleTimeUpdate}
            onProgress={updateBuffer}
            onPlay={(e) => {
              setIsPlaying(true);
              setIsBuffering(false);
              onPlay?.(e);
            }}
            onPause={(e) => {
              setIsPlaying(false);
              onPause?.(e);
            }}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => {
              setIsPlaying(true);
              setIsBuffering(false);
            }}
            onCanPlay={() => setIsBuffering(false)}
            onSeeked={() => {
              setIsBuffering(false);
              onSeeked?.();
            }}
            className="w-full h-full object-contain bg-black"
          >
            Your browser does not support the video tag.
          </video>

          {/* Quick Double-Tap Seek Ripples (Left & Right) */}
          {quickSeekRipple === 'left' && (
            <div className="absolute inset-y-0 left-0 w-1/3 flex items-center justify-center bg-white/10 backdrop-blur-xs pointer-events-none animate-ping">
              <div className="flex flex-col items-center gap-1 text-white font-black text-sm">
                <RotateCcw className="w-8 h-8" />
                <span>-10s</span>
              </div>
            </div>
          )}
          {quickSeekRipple === 'right' && (
            <div className="absolute inset-y-0 right-0 w-1/3 flex items-center justify-center bg-white/10 backdrop-blur-xs pointer-events-none animate-ping">
              <div className="flex flex-col items-center gap-1 text-white font-black text-sm">
                <RotateCw className="w-8 h-8" />
                <span>+10s</span>
              </div>
            </div>
          )}

          {/* Center Buffering Spinner Overlay */}
          {isBuffering && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
              <div className="w-14 h-14 rounded-full border-4 border-[#FF0055] border-t-transparent animate-spin shadow-xl shadow-[#FF0055]/40" />
            </div>
          )}

          {/* Center Play Icon when paused and not buffering */}
          {!isPlaying && !isBuffering && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/30 backdrop-blur-[1px] z-10 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#FF0055] flex items-center justify-center text-white shadow-2xl shadow-[#FF0055]/50 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Bottom Gradient Overlay for High-Contrast Controls */}
          <div 
            className={`absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none transition-opacity duration-300 z-30 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`} 
          />

          {/* ========================================================================= */}
          {/* CUSTOM YOUTUBE-STYLE CONTROLS OVERLAY */}
          {/* ========================================================================= */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`player-controls-container absolute inset-x-0 bottom-0 p-3 sm:p-4 z-40 transition-opacity duration-300 flex flex-col gap-2 ${
              showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* 1. Custom YouTube-Style Progress Bar with RED Played Track & Light Buffered Track */}
            <div 
              ref={progressTrackRef}
              onMouseDown={handleScrubMouseDown}
              onMouseMove={handleTrackMouseMove}
              onMouseLeave={handleTrackMouseLeave}
              className="relative w-full h-2.5 sm:h-3 py-1 flex items-center cursor-pointer group/scrub"
            >
              {/* Progress Background Track */}
              <div className="relative w-full h-1 sm:h-1.5 group-hover/scrub:h-2 rounded-full bg-white/20 overflow-hidden transition-all duration-150">
                {/* 1. Buffered Track (Grey/Translucent White: Shows already downloaded/buffered stream) */}
                <div 
                  className="absolute inset-y-0 left-0 bg-white/40 rounded-full transition-all duration-200"
                  style={{ width: `${bufferedPercent}%` }}
                />
                
                {/* 2. Played Track (Vibrant Brand Red: #FF0055 to #FF2E7E gradient) */}
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF0055] via-[#FF0055] to-[#FF2E7E] rounded-full shadow-sm shadow-[#FF0055]"
                  style={{ width: `${playedPercent}%` }}
                />
              </div>

              {/* Glowing Red Scrubber Thumb */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white ring-2 ring-[#FF0055] shadow-lg shadow-[#FF0055]/80 transform scale-0 group-hover/scrub:scale-100 transition-transform duration-150 pointer-events-none"
                style={{ left: `${playedPercent}%` }}
              />

              {/* Hover Preview Timestamp Tooltip */}
              {hoverTime !== null && (
                <div 
                  className="absolute bottom-4 -translate-x-1/2 px-2 py-0.5 rounded-md bg-neutral-900/95 border border-white/20 text-white font-mono text-[11px] font-bold shadow-lg pointer-events-none"
                  style={{ left: `${hoverPosition}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* 2. Main Control Bar: Play/Pause, Rewind, Volume, Time, Speed & Fullscreen */}
            <div className="flex items-center justify-between gap-2 text-white text-xs">
              
              {/* Left Controls: Play, Rewind/Forward, Volume, Time Display */}
              <div className="flex items-center gap-2 sm:gap-3.5">
                {/* Play / Pause Toggle Button */}
                <button 
                  onClick={togglePlay}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                  title={isPlaying ? "Pause (k)" : "Play (k)"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white" />
                  )}
                </button>

                {/* 10s Rewind Button */}
                <button 
                  onClick={() => seekRelative(-10)}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
                  title="Rewind 10 seconds (j)"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[10px] font-bold">10</span>
                </button>

                {/* 10s Forward Button */}
                <button 
                  onClick={() => seekRelative(+10)}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
                  title="Forward 10 seconds (l)"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-[10px] font-bold">10</span>
                </button>

                {/* Volume & Mute Controls */}
                <div className="flex items-center gap-1.5 group/volume">
                  <button 
                    onClick={toggleMute}
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? "Unmute (m)" : "Mute (m)"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5 text-neutral-400" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>

                  {/* Volume Slider Track */}
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-14 sm:w-20 h-1 accent-[#FF0055] cursor-pointer bg-white/20 rounded-full"
                    title="Volume (Up/Down Arrow)"
                  />
                </div>

                {/* Video Duration & Current Time Display ("video kitna mint ki ha wo dekhu") */}
                <div className="flex items-center gap-1 font-mono text-[11px] sm:text-xs font-semibold tracking-wide text-neutral-200">
                  <span className="text-white font-bold">{formatTime(currentTime)}</span>
                  <span className="text-neutral-500">/</span>
                  <span className="text-neutral-400 font-bold">{formatTime(effectiveDuration)}</span>
                </div>
              </div>

              {/* Right Controls: Playback Speed Menu & Fullscreen Toggle */}
              <div className="flex items-center gap-2">
                {/* Playback Speed Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-2 py-1 rounded-lg hover:bg-white/10 text-white/90 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Playback Speed"
                  >
                    <span>{playbackSpeed}x</span>
                  </button>

                  {/* Speed Selector Dropdown */}
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 py-1.5 w-28 rounded-xl bg-neutral-900/95 backdrop-blur-xl border border-white/15 shadow-2xl z-50 flex flex-col">
                      <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-white/10">
                        Speed
                      </div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handleSpeedChange(rate)}
                          className={`px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-[#FF0055]/20 hover:text-white transition-colors cursor-pointer ${
                            playbackSpeed === rate ? 'text-[#FF0055] font-bold' : 'text-neutral-300'
                          }`}
                        >
                          <span>{rate === 1 ? 'Normal' : `${rate}x`}</span>
                          {playbackSpeed === rate && <Check className="w-3.5 h-3.5 text-[#FF0055]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fullscreen Toggle Button */}
                <button 
                  onClick={toggleFullscreen}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>

            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950">
          <img 
            src={video?.thumbnail} 
            alt={video?.title} 
            className="w-full h-full object-cover filter brightness-75"
          />
        </div>
      )}

      {/* Floating Live Reactions Overlay */}
      {video?._id && <FloatingReactions videoId={video._id} />}
    </div>
  );
};

export default WatchPlayer;
