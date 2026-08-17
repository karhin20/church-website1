import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveAudioContext } from '@/contexts/LiveAudioContext';
import { Play, Pause, Volume2, VolumeX, Maximize2, X, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MiniFloatingLivePlayer: React.FC = () => {
  const {
    activeLiveEvent,
    userName,
    isPlaying,
    isMuted,
    connecting,
    listenerCount,
    togglePlay,
    toggleMute,
    leaveStream,
  } = useLiveAudioContext();

  const location = useLocation();
  const navigate = useNavigate();

  // Hide mini player if no active event, or user has not set name yet, or user is already on full /live page
  if (!activeLiveEvent || !userName || location.pathname === '/live') {
    return null;
  }

  const formattedCount = listenerCount >= 1000 
    ? `${(listenerCount / 1000).toFixed(1)}K` 
    : listenerCount.toString();

  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-40 w-[92%] max-w-md bg-gray-900/95 backdrop-blur-md text-white rounded-full p-2.5 px-4 shadow-2xl border border-white/15 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 font-sans">
      
      {/* Left: Mini Equalizer & Event Info */}
      <div 
        onClick={() => navigate('/live')} 
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
      >
        {/* Live Red Dot & Equalizer */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/40">
            {isPlaying && !isMuted ? (
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-1 bg-red-500 rounded-full animate-bounce [animation-duration:600ms]" style={{ height: '100%' }} />
                <span className="w-1 bg-pink-500 rounded-full animate-bounce [animation-duration:800ms]" style={{ height: '70%' }} />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-duration:500ms]" style={{ height: '90%' }} />
              </div>
            ) : (
              <Radio className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>

        {/* Title & Speaker */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
              LIVE
            </span>
            <span className="text-[10px] text-gray-400 font-semibold">
              {formattedCount} Listening
            </span>
          </div>
          <h4 className="text-xs font-bold text-white truncate group-hover:text-pink-300 transition-colors">
            {activeLiveEvent.title}
          </h4>
        </div>
      </div>

      {/* Right Controls Row */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={connecting}
          className="w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center font-bold hover:bg-gray-100 transition-transform active:scale-95 shadow"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
        </button>

        {/* Expand / Open Live Page */}
        <button
          onClick={() => navigate('/live')}
          className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          title="Open Full Live Page"
        >
          <Maximize2 className="w-4 h-4 text-purple-400" />
        </button>

        {/* Close / Leave Stream */}
        <button
          onClick={leaveStream}
          className="p-1.5 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
          title="Leave Stream"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
