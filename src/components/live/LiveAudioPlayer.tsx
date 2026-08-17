import { useState } from 'react';
import { LiveEventItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX, Play, Pause, Radio, User, MicVocal, LogOut, WifiOff } from 'lucide-react';
import TemporalLiveChat from './TemporalLiveChat';
import { useLiveAudioContext } from '@/contexts/LiveAudioContext';

interface LiveAudioPlayerProps {
  event: LiveEventItem;
}

export default function LiveAudioPlayer({ event }: LiveAudioPlayerProps) {
  const {
    userName,
    setUserName,
    isPlaying,
    isMuted,
    connecting,
    listenerCount,
    activeListeners,
    autoplayBlocked,
    streamEndedByAdmin,
    leaveStream,
    togglePlay,
    toggleMute,
  } = useLiveAudioContext();

  const [inputName, setInputName] = useState('');

  // Dynamic speaker names parsed from event speaker field
  const speakerNames = event.speaker 
    ? event.speaker.split(/[,&]/).map((s) => s.trim()).filter(Boolean)
    : [];

  // Host name as requested: TAC-GH, NBC
  const hostName = 'TAC-GH, NBC';

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    setUserName(inputName.trim());
  };

  const handleLeaveStream = async () => {
    await leaveStream();
    localStorage.removeItem('tac_listener_name');
    setUserName('');
    setInputName('');
  };

  const formattedCount = listenerCount >= 1000 
    ? `${(listenerCount / 1000).toFixed(1)}K` 
    : listenerCount.toString();

  // ── Stream ended view ──────────────────────────────────────────────────
  if (streamEndedByAdmin) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-gray-900 to-church-primary text-white p-8 rounded-3xl shadow-2xl border border-white/10 text-center font-sans">
        <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-5">
          <WifiOff className="w-10 h-10 text-red-400" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Stream Has Ended</h3>
        <p className="text-gray-300 text-sm mb-1">
          The admin has ended this live broadcast.
        </p>
        <p className="text-gray-400 text-xs mb-6">
          Thank you for joining us today. God bless you! 🙏
        </p>
        <div className="w-full h-px bg-white/10 mb-6" />
        <p className="text-xs text-gray-500">
          Check back during our next service for another live session.
        </p>
      </div>
    );
  }

  // ── Name prompt ──────────────────────────────────────────────────────────
  if (!userName) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100 font-sans">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-4 bg-red-50 rounded-full text-red-600 mb-4 shadow-inner">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Join Live Audio Stream</h3>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Enter your name to start listening and participate in the live service chat.
          </p>
        </div>

        <form onSubmit={handleSaveName} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Your Name</Label>
            <div className="relative mt-1.5">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="pl-11 h-12 rounded-xl border-gray-200 focus:border-church-primary text-sm"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 bg-church-primary text-white font-bold rounded-xl hover:bg-church-primary/90 text-base shadow-md transition-all">
            Start Listening Now
          </Button>
        </form>
      </div>
    );
  }

  // Combine host, speaker names, and joined listeners
  const allPeopleOnStream = [
    { name: hostName, role: 'HOST', isHost: true },
    ...speakerNames.map((s) => ({ name: s, role: 'SPEAKER', isHost: false })),
    ...activeListeners.map((l) => ({ name: l, role: 'LISTENER', isHost: false })),
  ];

  return (
    <div className="max-w-md mx-auto bg-white rounded-[36px] shadow-2xl overflow-hidden border border-gray-200 relative font-sans text-gray-900">
      
      {/* ── STAGE / PLAYER HEADER ────────────────────────────────────────── */}
      <div className="p-6 pt-5 pb-4 bg-gradient-to-b from-slate-50 via-white to-gray-50/50">
        
        {/* Status Badges */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            LIVE
          </span>
          <span className="bg-gray-200/80 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
            {formattedCount} Listening
          </span>
        </div>

        {/* Autoplay Warning */}
        {autoplayBlocked && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3 animate-pulse">
            <span>Click "Start Audio" to listen</span>
            <Button
              size="sm"
              onClick={togglePlay}
              className="bg-amber-600 text-white font-bold hover:bg-amber-700 h-7 px-3 text-xs rounded-lg flex-shrink-0"
            >
              Start Audio
            </Button>
          </div>
        )}

        {/* Multicolored Audio Waveform Visualizer */}
        <div className="w-full max-w-xs mx-auto my-3">
          <GradientAudioWaveform isPlaying={isPlaying} isMuted={isMuted} connecting={connecting} />
        </div>

        {/* Lower Card showing Event/Sermon Title & Speaker */}
        <div className="my-5 flex items-center justify-center">
          <div className="w-full max-w-xs rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-4 text-white text-center shadow-xl border border-white/10">
            <h2 className="text-base font-bold leading-snug text-white line-clamp-2 mb-1">
              {event.title}
            </h2>
            {event.speaker && (
              <p className="text-xs text-purple-200 flex items-center justify-center gap-1">
                <MicVocal className="w-3.5 h-3.5 text-pink-400" />
                <span>{event.speaker}</span>
              </p>
            )}
          </div>
        </div>

        {/* Dynamic & Scrollable Silhouette Avatars for Host, Speakers & Joined Listeners */}
        <div className="my-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 text-center mb-2">
            ON THE STREAM
          </p>
          
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-3 max-w-full justify-start">
            {allPeopleOnStream.map((person, index) => {
              const borderGradients = [
                'from-emerald-400 to-teal-500',
                'from-yellow-400 to-amber-500',
                'from-cyan-400 to-blue-500',
                'from-purple-400 to-pink-500',
              ];
              const gradientClass = person.isHost 
                ? 'from-emerald-400 to-teal-500' 
                : borderGradients[index % borderGradients.length];

              return (
                <div key={`${person.name}-${index}`} className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-14 h-14 rounded-full p-1 bg-gradient-to-r ${gradientClass} shadow-md relative flex items-center justify-center ${isPlaying && person.isHost ? 'ring-2 ring-emerald-400/50' : ''}`}>
                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center border-2 border-white overflow-hidden text-gray-600">
                      <User className="w-7 h-7 text-gray-500 stroke-[1.75]" />
                    </div>
                    <span className="absolute -bottom-1.5 bg-gray-900 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow whitespace-nowrap">
                      {person.role}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-800 mt-2 text-center max-w-[84px] truncate">
                    {person.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls Row: Prominent Mute/Sound, Play/Pause, and Leave Buttons */}
        <div className="mt-6 flex items-center justify-center gap-3">
          {/* Prominent Mute/Sound Button */}
          <button
            onClick={toggleMute}
            className={`h-12 px-4 rounded-full font-bold flex items-center gap-2 transition-all shadow-md ${
              isMuted 
                ? 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
            }`}
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-6 h-6 text-red-600" />
                <span className="text-xs">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-6 h-6 text-gray-900" />
                <span className="text-xs">Sound On</span>
              </>
            )}
          </button>

          {/* Center Play/Pause Button */}
          <Button
            onClick={togglePlay}
            disabled={connecting}
            className="h-12 px-6 rounded-full bg-gray-900 text-white hover:bg-gray-800 font-bold flex items-center gap-2 shadow-lg text-sm"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{connecting ? 'Connecting...' : isPlaying ? 'Pause' : 'Play Live'}</span>
          </Button>

          {/* Prominent Leave Icon Button */}
          <button
            onClick={handleLeaveStream}
            className="h-12 px-4 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold flex items-center gap-2 transition-all shadow-md"
            title="Leave Stream"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span className="text-xs">Leave</span>
          </button>
        </div>
      </div>

      {/* ── LIVE CHAT CONTAINER ───────────────────────────────────────────── */}
      <div className="bg-white rounded-t-[28px] border-t border-gray-100 shadow-2xl pt-2 relative z-10">
        <TemporalLiveChat 
          eventId={event.id} 
          userName={userName}
        />
      </div>
    </div>
  );
}

// ── Multicolored Gradient Audio Waveform ─────────────────────────────────────
const BARS_COUNT = 34;
const WAVE_BARS = Array.from({ length: BARS_COUNT }, (_, i) => {
  const ratio = i / BARS_COUNT;
  let color = 'from-purple-500 to-pink-500';
  if (ratio > 0.6) color = 'from-pink-500 to-amber-400';
  else if (ratio > 0.3) color = 'from-indigo-500 to-pink-500';

  return {
    delay: `${(i * 0.05).toFixed(2)}s`,
    height: [40, 75, 50, 95, 60, 85, 45, 100, 65, 80, 55, 90][i % 12],
    color,
  };
});

function GradientAudioWaveform({ isPlaying, isMuted, connecting }: { isPlaying: boolean; isMuted: boolean; connecting: boolean }) {
  return (
    <div className="w-full flex items-center justify-center gap-1 h-14 px-2">
      {WAVE_BARS.map((bar, i) => (
        <div
          key={i}
          className={`flex-1 rounded-full bg-gradient-to-t ${
            isPlaying && !isMuted ? bar.color : 'from-gray-300 to-gray-200'
          }`}
          style={{
            height: isPlaying && !isMuted 
              ? `${bar.height}%` 
              : connecting 
              ? `${25 + Math.sin(i) * 15}%` 
              : '20%',
            animationName: isPlaying && !isMuted ? 'gradientWave' : 'none',
            animationDuration: isPlaying && !isMuted ? `${0.7 + (i % 4) * 0.15}s` : '0s',
            animationDelay: bar.delay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            transition: 'height 0.3s ease',
          }}
        />
      ))}
      <style>{`
        @keyframes gradientWave {
          0%   { transform: scaleY(0.25); }
          50%  { transform: scaleY(1.0);  }
          100% { transform: scaleY(0.35); }
        }
      `}</style>
    </div>
  );
}
