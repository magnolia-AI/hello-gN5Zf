import React, { useRef, useState, useEffect } from 'react';

interface VideoProps {
  /** Video source URL */
  src: string;

  /** Alternative video sources for different formats (e.g., WebM, MP4) */
  sources?: { src: string; type: string }[];

  /** 
   * Thumbnail image URL. Required when playOnHover is enabled.
   * Should be a high-quality image representing the video content.
   */
  thumbnail?: string;

  /** 
   * Enable autoplay. Default: true for background videos, false for interactive videos.
   * Note: Many browsers block autoplay with sound.
   */
  autoplay?: boolean;

  /** Enable video looping. Default: true for background videos. */
  loop?: boolean;

  /** 
   * Enable hover-to-play mode. Shows thumbnail until hovered, then plays video.
   * Requires thumbnail prop to be provided for proper functionality.
   */
  playOnHover?: boolean;

  /** Mute video audio. Default: true for background videos. */
  muted?: boolean;

  /** Show native video controls. Default: false for background videos. */
  controls?: boolean;

  /** Video container width. Default: '100%' */
  width?: string | number;

  /** Video container height. Default: 'auto' */
  height?: string | number;

  /** Additional CSS class name for the container */
  className?: string;

  /** Additional inline styles for the container */
  style?: React.CSSProperties;

  /** Callback fired when video starts playing */
  onPlay?: () => void;

  /** Callback fired when video is paused */
  onPause?: () => void;

  /** Callback fired when video ends */
  onEnded?: () => void;

  /** Alt text for accessibility. Describes the video content. */
  alt?: string;
}

/**
 * Video component optimized for background videos and hover interactions.
 * 
 * Features:
 * - Background video mode with autoplay and loop
 * - Hover-to-play mode with thumbnail preview
 * - Multiple video format support
 * - Accessible and responsive design
 * 
 * @example
 * // Background video
 * <Video src="/hero-video.mp4" />
 * 
 * @example
 * // Hover-to-play with thumbnail
 * <Video 
 *   src="/demo-video.mp4" 
 *   playOnHover={true}
 *   thumbnail="/video-thumb.jpg"
 * />
 */
const Video: React.FC<VideoProps> = ({
  src,
  sources = [],
  thumbnail,
  autoplay = true,
  loop = true,
  playOnHover = false,
  muted = true,
  controls = false,
  width = '100%',
  height = 'auto',
  className = '',
  style = {},
  onPlay,
  onPause,
  onEnded,
  alt = 'Video content',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Handle autoplay for non-hover videos
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoError || playOnHover) return;

    if (autoplay) {
      video.play().catch((error) => {
        // Ignore autoplay policy blocks, only handle actual errors
        if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
          setVideoError(true);
        }
      });
    }
  }, [autoplay, playOnHover, videoError]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handlePlay = () => onPlay?.();
  const handlePause = () => onPause?.();
  const handleEnded = () => onEnded?.();
  const handleError = () => setVideoError(true);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width,
    height,
    overflow: 'hidden',
    cursor: playOnHover && thumbnail ? 'pointer' : 'default',
    ...style,
  };

  // Hover mode - requires thumbnail for proper functionality
  if (playOnHover) {
    if (!thumbnail) {
      // Fallback to regular video when no thumbnail provided
      return (
        <div className={`video-container ${className}`} style={containerStyle}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            playsInline
            preload={controls ? "metadata" : "auto"}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
          >
            {sources.length > 0 ? (
              sources.map((source, index) => (
                <source key={index} src={source.src} type={source.type} />
              ))
            ) : (
              <source src={src} type="video/mp4" />
            )}
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return (
      <div
        className={`video-container ${className}`}
        style={containerStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!isHovered ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.3s ease'
            }}
            draggable={false}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.3s ease'
            }}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
          >
            {sources.length > 0 ? (
              sources.map((source, index) => (
                <source key={index} src={source.src} type={source.type} />
              ))
            ) : (
              <source src={src} type="video/mp4" />
            )}
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    );
  }

  // Regular video mode
  return (
    <div className={`video-container ${className}`} style={containerStyle}>
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline
        preload={controls ? "metadata" : "auto"}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
      >
        {sources.length > 0 ? (
          sources.map((source, index) => (
            <source key={index} src={source.src} type={source.type} />
          ))
        ) : (
          <source src={src} type="video/mp4" />
        )}
        Your browser does not support the video tag.
      </video>

      {videoError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            color: '#666',
            fontSize: '14px',
          }}
        >
          Video unavailable
        </div>
      )}
    </div>
  );
};

export default Video;
