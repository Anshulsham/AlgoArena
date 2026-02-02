import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Volume2, VolumeX, Clapperboard, Video } from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, isDarkMode = true }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0); // Track duration dynamically
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };
    const handleEnded = () => setIsPlaying(false);

    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Meta */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-sm">
            <Clapperboard size={20} />
          </div>
          <div>
            <h3 className={`text-[13px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>Video Editorial</h3>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Deployment Walkthrough</p>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div 
        className={`relative w-full rounded-[2.5rem] overflow-hidden border transition-all duration-500 group shadow-2xl ${
          isDarkMode ? 'bg-zinc-950 border-zinc-800 shadow-indigo-500/5' : 'bg-black border-zinc-200'
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <video
          ref={videoRef}
          src={secureUrl}
          poster={thumbnailUrl}
          onClick={togglePlayPause}
          onLoadedMetadata={onLoadedMetadata} // CRITICAL FIX: Loads the video length
          className="w-full h-auto max-h-[500px] cursor-pointer object-contain mx-auto"
        />
        
        {/* Play Overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] cursor-pointer"
            onClick={togglePlayPause}
          >
            <div className="w-20 h-20 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl scale-95 hover:scale-100 transition-transform duration-300">
              <Play size={32} fill="currentColor" className="ml-1" />
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pt-20 pb-6 px-8 transition-all duration-500 ${
            isHovering || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="space-y-4">
            {/* Progress Bar (Standardized to Indigo) */}
            <input
              type="range"
              min="0"
              max={videoDuration || 0} // Uses dynamically loaded duration
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button onClick={togglePlayPause} className="text-white hover:text-indigo-400 transition-all">
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>

                <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                {/* Counter (Zinc Typography) */}
                <div className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <span className="text-indigo-400">{formatTime(currentTime)}</span>
                  <span className="mx-2 text-zinc-700">/</span>
                  <span>{formatTime(videoDuration)}</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Buffered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Section (Standardized with Profile) */}
      <div className={`p-6 rounded-[1.5rem] border flex items-start gap-4 transition-colors ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
        <Video size={18} className="text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-[11px] font-bold text-zinc-500 leading-relaxed uppercase tracking-wider">
          Pro Tip: Use the timeline to skip to <span className={isDarkMode ? 'text-zinc-300' : 'text-zinc-900'}>Logic Implementation</span> if you've already analyzed the constraints.
        </p>
      </div>
    </div>
  );
};

export default Editorial;