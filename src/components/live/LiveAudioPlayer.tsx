import { useState, useEffect, useRef } from 'react';
import { LiveEventItem, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX, Play, Pause, Radio, User, MicVocal, LogOut, WifiOff, MoreHorizontal, Headphones } from 'lucide-react';
import AgoraRTC, { IAgoraRTCClient, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import TemporalLiveChat from './TemporalLiveChat';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://backend-church.vercel.app');

interface LiveAudioPlayerProps {
  event: LiveEventItem;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

export default function LiveAudioPlayer({ event }: LiveAudioPlayerProps) {
  const [userName, setUserName] = useState(() => localStorage.getItem('tac_listener_name') || '');
  const [inputName, setInputName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showVolumeSlider, setShowVolumeSlider] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [streamEndedByAdmin, setStreamEndedByAdmin] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [listenerCount, setListenerCount] = useState<number>(1);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const remoteAudioTrackRef = useRef<IRemoteAudioTrack | null>(null);
  const listenerIdRef = useRef<string>(
    (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `listener-${Date.now()}-${Math.random()}`
  );

  // ── Watch for admin ending the stream via Supabase Realtime ──────────────
  useEffect(() => {
    const channel = supabase
      .channel(`live_event_status:${event.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_events',
          filter: `id=eq.${event.id}`,
        },
        (payload) => {
          const updated = payload.new as LiveEventItem;
          if (updated.status === 'ended') {
            leaveStream();
            setStreamEndedByAdmin(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id]);

  // ── Track listener presence and count ─────────────────────────────────────
  useEffect(() => {
    if (!userName) return;

    const presenceChannel = supabase.channel(`live_listeners:${event.id}`, {
      config: { presence: { key: listenerIdRef.current } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const count = Object.keys(state).length;
        setListenerCount(Math.max(count, 1));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            userName,
            joined_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
  }, [event.id, userName]);

  // ── Floating Reactions Realtime Broadcast ───────────────────────────
  useEffect(() => {
    const reactionChannel = supabase.channel(`live_reactions:${event.id}`)
      .on('broadcast', { event: 'reaction' }, (payload) => {
        if (payload.payload && payload.payload.emoji) {
          triggerFloatingEmoji(payload.payload.emoji, false);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(reactionChannel);
    };
  }, [event.id]);

  const sendReaction = (emoji: string) => {
    triggerFloatingEmoji(emoji, true);
    supabase.channel(`live_reactions:${event.id}`).send({
      type: 'broadcast',
      event: 'reaction',
      payload: { emoji, user: userName },
    });
  };

  const triggerFloatingEmoji = (emoji: string, isSelf = false) => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = isSelf ? 70 + Math.random() * 20 : 60 + Math.random() * 30; // Float on right side
    setFloatingReactions((prev) => [...prev.slice(-15), { id, emoji, x }]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2800);
  };

  // ── Browser Autoplay failure handler ──────────────────────────────
  useEffect(() => {
    const handleAutoplayFailed = () => {
      console.warn("Autoplay blocked by browser policy");
      setAutoplayBlocked(true);
      setIsPlaying(false);
    };

    AgoraRTC.onAutoplayFailed = handleAutoplayFailed;

    return () => {
      AgoraRTC.onAutoplayFailed = null;
    };
  }, []);

  useEffect(() => {
    if (userName) {
      joinStream();
    }
    return () => {
      leaveStream();
    };
  }, [event.agora_channel, userName]);

  const joinStream = async () => {
    if (clientRef.current) return;
    setConnecting(true);

    try {
      const tokenRes = await fetch(`${API_BASE_URL}/api/agora/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName: event.agora_channel, role: 'audience' }),
      });

      if (!tokenRes.ok) {
        throw new Error('Failed to fetch Agora token from backend');
      }

      const { appId, token } = await tokenRes.json();

      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      await client.setClientRole('audience');

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio' && user.audioTrack) {
          remoteAudioTrackRef.current = user.audioTrack;
          user.audioTrack.setVolume(volume);
          user.audioTrack.play();
          setIsPlaying(true);
          setMediaSession(event.title, event.speaker || 'Church Minister', 'playing');
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'audio') {
          setIsPlaying(false);
          setMediaSession(event.title, event.speaker || 'Church Minister', 'paused');
        }
      });

      await client.join(appId, event.agora_channel, token || null, null);
      setHasJoined(true);
    } catch (err) {
      console.error('Error joining live audio stream via backend token:', err);
    } finally {
      setConnecting(false);
    }
  };

  const leaveStream = async () => {
    if (remoteAudioTrackRef.current) {
      remoteAudioTrackRef.current.stop();
      remoteAudioTrackRef.current = null;
    }
    if (clientRef.current) {
      try {
        await clientRef.current.leave();
      } catch (e) {
        // ignore leave error
      }
      clientRef.current = null;
    }
    setHasJoined(false);
    setIsPlaying(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  };

  const handleLeaveStream = async () => {
    await leaveStream();
    localStorage.removeItem('tac_listener_name');
    setUserName('');
    setInputName('');
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    const name = inputName.trim();
    localStorage.setItem('tac_listener_name', name);
    setUserName(name);
  };

  const togglePlay = () => {
    if (remoteAudioTrackRef.current) {
      if (isPlaying) {
        remoteAudioTrackRef.current.stop();
        setIsPlaying(false);
        setMediaSession(event.title, event.speaker || 'Church Minister', 'paused');
      } else {
        remoteAudioTrackRef.current.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
        setMediaSession(event.title, event.speaker || 'Church Minister', 'playing');
      }
    }
  };

  const toggleMute = () => {
    if (remoteAudioTrackRef.current) {
      if (isMuted) {
        remoteAudioTrackRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        remoteAudioTrackRef.current.setVolume(0);
        setIsMuted(true);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
    if (remoteAudioTrackRef.current && !isMuted) {
      remoteAudioTrackRef.current.setVolume(newVol);
    }
  };

  // ── Format listener count (e.g. 6800 -> 6.8K) ──────────────────────────
  const formattedCount = listenerCount >= 1000 
    ? `${(listenerCount / 1000).toFixed(1)}K` 
    : listenerCount.toString();

  // ── Stream ended by admin view ─────────────────────────────────────────
  if (streamEndedByAdmin) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-gray-900 to-church-primary text-white p-8 rounded-2xl shadow-2xl border border-white/10 text-center">
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

  // ── Name input screen ──────────────────────────────────────────────────
  if (!userName) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-4 bg-red-50 rounded-full text-red-600 mb-4 shadow-inner">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Join Live Audio Stream</h3>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Enter your name to start listening and participate in the live event chat.
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

  // ── Reference Design Mobile-First Layout ─────────────────────────────────
  return (
    <div className="max-w-md mx-auto bg-white rounded-[36px] shadow-2xl overflow-hidden border border-gray-200 relative font-sans text-gray-900">
      {/* Dynamic Floating Reactions Canvas */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        <AnimatePresence>
          {floatingReactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 1, y: 350, scale: 0.8, x: `${r.x}%` }}
              animate={{
                opacity: [1, 1, 0],
                y: [350, 150, -50],
                scale: [0.8, 1.2, 1.4],
                x: [`${r.x}%`, `${r.x - 5}%`, `${r.x + 8}%`],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.6, ease: "easeOut" }}
              className="absolute text-2xl drop-shadow-md"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── STAGE / PODCAST HEADER ────────────────────────────────────────── */}
      <div className="p-6 pt-5 pb-4 bg-gradient-to-b from-slate-50 via-white to-gray-50/50 relative">
        {/* Header Bar */}
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex-1 pr-2">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight mb-2">
              {event.title || 'The Daily Creative: How to Scale Your Ideas'}
            </h1>
            
            {/* Status Pills */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                LIVE
              </span>
              <span className="bg-gray-200/80 text-gray-700 text-xs font-semibold px-3 py-0.5 rounded-full">
                {formattedCount} Listening
              </span>
            </div>
          </div>

          {/* Top Right Action Menu & Volume Control */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className={`p-2 rounded-full transition-colors ${showVolumeSlider ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Toggle Volume Overlay"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-gray-800" />}
            </button>
            <button 
              onClick={handleLeaveStream} 
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Leave Stream"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Autoplay Warning Banner */}
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

        {/* Stage Content Container */}
        <div className="relative my-2 py-4 flex flex-col items-center justify-center">
          
          {/* Native Mobile Vertical Volume Slider Overlay (Right Side) */}
          {showVolumeSlider && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 flex flex-col items-center bg-gray-200/90 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/40 h-44 w-11 justify-between transition-all">
              {/* Vertical Range Slider */}
              <div className="relative flex-1 w-full flex items-center justify-center py-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="h-28 w-2 appearance-none bg-gray-300 rounded-full cursor-pointer accent-gray-800 focus:outline-none"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                />
              </div>
              <button 
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-700 hover:text-black transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-gray-800" />}
              </button>
            </div>
          )}

          {/* Multicolored Audio Waveform Background */}
          <div className="w-full max-w-xs mb-3 px-4">
            <GradientAudioWaveform isPlaying={isPlaying} isMuted={isMuted} connecting={connecting} />
          </div>

          {/* Center Episode Artwork Square */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-xl flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-slate-900 rounded-[14px] flex flex-col items-center justify-center text-white p-2 text-center">
                <Radio className="w-6 h-6 text-pink-400 mb-1" />
                <span className="text-[10px] font-black tracking-widest text-pink-300 uppercase">EPISODE</span>
                <span className="text-lg font-black leading-none text-white">145</span>
              </div>
            </div>
          </div>

          {/* Host & Speaker Avatars Stage Arrangement */}
          <div className="w-full max-w-xs flex flex-col items-center">
            {/* Main Host Avatar (Top Center) */}
            <div className="flex flex-col items-center mb-4 relative">
              <div className={`w-16 h-16 rounded-full p-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 shadow-md relative ${isPlaying ? 'ring-4 ring-emerald-400/30' : ''}`}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Host Alex"
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
                <span className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                  HOST
                </span>
              </div>
              <span className="text-xs font-bold text-gray-800 mt-2">{event.speaker || 'Alex'}</span>
            </div>

            {/* Guests (Bottom Left & Right) */}
            <div className="flex items-center justify-center gap-8 w-full">
              {/* Guest 1 */}
              <div className="flex flex-col items-center relative">
                <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-r from-yellow-400 to-lime-500 shadow-sm relative">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
                    alt="Guest 1 Maya"
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                  <span className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 bg-lime-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow whitespace-nowrap">
                    GUEST 1
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-800 mt-2">Maya</span>
              </div>

              {/* Guest 2 */}
              <div className="flex flex-col items-center relative">
                <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-sm relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    alt="Guest 2 Ken"
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                  <span className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow whitespace-nowrap">
                    GUEST 2
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-800 mt-2">Ken</span>
              </div>
            </div>
          </div>

          {/* Central Play/Pause Toggle Bar */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              onClick={togglePlay}
              disabled={connecting}
              className="h-11 px-6 rounded-full bg-gray-900 text-white hover:bg-gray-800 font-bold flex items-center gap-2 shadow-lg text-xs"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{connecting ? 'Connecting...' : isPlaying ? 'Pause Audio' : 'Play Live Audio'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── LIVE CHAT CARD CONTAINER (Curved Bottom Sheet) ───────────────── */}
      <div className="bg-white rounded-t-[28px] border-t border-gray-100 shadow-2xl pt-2 relative z-10">
        <TemporalLiveChat 
          eventId={event.id} 
          userName={userName}
          onSendReaction={sendReaction}
        />
      </div>
    </div>
  );
}

// ── Media Session Helper ────────────────────────────────────────────────────
function setMediaSession(title: string, artist: string, state: 'playing' | 'paused' | 'none') {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist,
    album: 'TAC Live Broadcast',
    artwork: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  });
  navigator.mediaSession.playbackState = state;
}

// ── Multicolored Gradient Audio Waveform ─────────────────────────────────────
const BARS_COUNT = 34;
const WAVE_BARS = Array.from({ length: BARS_COUNT }, (_, i) => {
  const ratio = i / BARS_COUNT;
  // Multicolored gradient colors: purple -> pink -> orange/yellow
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
