import { useState, useEffect, useRef } from 'react';
import { LiveEventItem, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX, Play, Pause, Radio, User, MicVocal, LogOut, WifiOff } from 'lucide-react';
import AgoraRTC, { IAgoraRTCClient, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import TemporalLiveChat from './TemporalLiveChat';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://backend-church.vercel.app');

interface LiveAudioPlayerProps {
  event: LiveEventItem;
}

export default function LiveAudioPlayer({ event }: LiveAudioPlayerProps) {
  const [userName, setUserName] = useState(() => localStorage.getItem('tac_listener_name') || '');
  const [inputName, setInputName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [connecting, setConnecting] = useState(false);
  const [streamEndedByAdmin, setStreamEndedByAdmin] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const remoteAudioTrackRef = useRef<IRemoteAudioTrack | null>(null);

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
            // Admin ended the stream — force everyone out immediately
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

  // ── Register global callback for when browser blocks autoplay ───────────
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
      // 1. Obtain Agora Token from Express Backend API
      const tokenRes = await fetch(`${API_BASE_URL}/api/agora/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName: event.agora_channel, role: 'audience' }),
      });

      if (!tokenRes.ok) {
        throw new Error('Failed to fetch Agora token from backend');
      }

      const { appId, token } = await tokenRes.json();

      // 2. Initialize Client & Subscribe using Backend Token
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
          // Register with OS Media Session so audio continues on screen lock
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

  // Full leave — disconnect and return to name screen
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
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (remoteAudioTrackRef.current && !isMuted) {
      remoteAudioTrackRef.current.setVolume(val);
    }
  };

  // ── Stream ended by admin — show override screen to all listeners ──────────
  if (streamEndedByAdmin) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-gray-900 to-church-primary text-white p-8 rounded-xl shadow-xl border border-white/10 text-center">
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

  if (!userName) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg border border-church-primary/10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full text-red-600 mb-3">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-church-primary">Join Live Audio Stream</h3>
          <p className="text-sm text-gray-600 mt-1">
            Please enter your name to listen and participate in the live event chat. No sign-up required!
          </p>
        </div>

        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <div className="relative mt-1">
              <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Brother Samuel"
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-church-secondary text-church-primary font-bold py-3 hover:bg-church-secondary/90 text-base">
            Start Listening Now
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
      {/* Audio Player Card (3 cols) */}
      <div className="md:col-span-3 bg-gradient-to-br from-church-primary via-slate-900 to-church-primary text-white rounded-xl shadow-xl p-6 flex flex-col justify-between border border-church-secondary/20">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Live Listening Cloud</span>
            </div>

            <div className="text-xs text-gray-300 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-church-secondary" />
              <span>{userName}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('tac_listener_name');
                  setUserName('');
                }}
                className="ml-2 text-[10px] text-church-secondary underline hover:text-white"
              >
                Change
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-church-secondary mb-1">{event.title}</h3>
            <p className="text-sm text-gray-300 flex items-center gap-2">
              <MicVocal className="w-4 h-4 text-church-secondary" />
              <span>Speaker: {event.speaker || 'Church Minister'}</span>
            </p>
            {event.description && (
              <p className="text-xs text-gray-400 mt-2 italic">{event.description}</p>
            )}
          </div>
        </div>

        {/* Browser Autoplay Block Warning */}
        {autoplayBlocked && (
          <div className="mb-3 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-200 text-xs flex items-center justify-between gap-3 animate-pulse">
            <span>Browser blocked automatic audio. Click "Play" or "Start Audio" to listen.</span>
            <Button
              size="sm"
              onClick={() => {
                if (remoteAudioTrackRef.current) {
                  remoteAudioTrackRef.current.play();
                  setIsPlaying(true);
                  setAutoplayBlocked(false);
                  setMediaSession(event.title, event.speaker || 'Church Minister', 'playing');
                }
              }}
              className="bg-church-secondary text-church-primary font-bold hover:bg-white h-7 px-3 text-[11px] rounded flex-shrink-0"
            >
              Start Audio
            </Button>
          </div>
        )}

        {/* Audio Waveform Visualizer */}
        <AudioWaveform isPlaying={isPlaying} isMuted={isMuted} connecting={connecting} />

        {/* Player controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={togglePlay}
                disabled={connecting}
                className="w-12 h-12 rounded-full bg-church-secondary text-church-primary hover:bg-white transition-transform transform active:scale-95 flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </Button>

              <div>
                <span className="text-sm font-semibold">
                  {connecting ? 'Connecting...' : isPlaying ? 'Receiving Live Audio' : 'Audio Paused'}
                </span>
                <p className="text-xs text-gray-300">Agora Listening Cloud</p>
              </div>
            </div>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-gray-300 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-church-secondary" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full accent-church-secondary cursor-pointer h-1.5 bg-gray-600 rounded-lg"
            />
            <span className="text-xs font-mono text-gray-300 w-8">{isMuted ? '0%' : `${volume}%`}</span>
          </div>

          {/* Leave Stream */}
          <button
            onClick={handleLeaveStream}
            className="w-full flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 rounded-md py-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Leave Stream
          </button>
        </div>
      </div>

      {/* Live Event Temporal Chat (2 cols) */}
      <div className="md:col-span-2">
        <TemporalLiveChat eventId={event.id} userName={userName} />
      </div>
    </div>
  );
}

// ─── Media Session API helper (background / lock-screen audio) ────────────────

function setMediaSession(
  title: string,
  artist: string,
  state: 'playing' | 'paused' | 'none'
) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist,
    album: 'TAC Nii Boiman Central — Live Stream',
    artwork: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  });
  navigator.mediaSession.playbackState = state;
}

// ─── Audio Waveform Visualizer ───────────────────────────────────────────────

const BAR_COUNT = 28;

// Each bar gets a random-looking but fixed height pattern and animation delay
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => ({
  delay: `${(i * 0.07).toFixed(2)}s`,
  height: [40, 70, 55, 90, 65, 80, 45, 95, 60, 75, 50, 85, 40, 70, 55, 90, 65, 80, 45, 95, 60, 75, 50, 85, 40, 70, 55, 90][i % 28],
}));

interface AudioWaveformProps {
  isPlaying: boolean;
  isMuted: boolean;
  connecting: boolean;
}

function AudioWaveform({ isPlaying, isMuted, connecting }: AudioWaveformProps) {
  const barColor = isMuted
    ? 'bg-gray-500'
    : isPlaying
    ? 'bg-church-secondary'
    : 'bg-white/30';

  return (
    <div className="my-4 px-1">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
          {connecting ? 'Connecting…' : isPlaying ? (isMuted ? 'Muted' : '🔴 Receiving Live Audio') : 'Stream Paused'}
        </span>
        {isPlaying && !isMuted && (
          <span className="text-[10px] text-church-secondary animate-pulse font-semibold">● LIVE</span>
        )}
      </div>

      {/* Waveform bars */}
      <div
        className="flex items-center justify-between gap-px w-full"
        style={{ height: '52px' }}
        aria-label="Audio waveform visualizer"
      >
        {BARS.map((bar, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-300 ${barColor}`}
            style={{
              height: isPlaying && !isMuted
                ? `${bar.height}%`
                : connecting
                ? `${20 + Math.sin(i) * 10}%`
                : '15%',
              animationName: isPlaying && !isMuted ? 'waveform' : 'none',
              animationDuration: isPlaying && !isMuted ? `${0.8 + (i % 5) * 0.15}s` : '0s',
              animationDelay: bar.delay,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              transition: 'height 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Inject waveform keyframes once */}
      <style>{`
        @keyframes waveform {
          0%   { transform: scaleY(0.3); }
          50%  { transform: scaleY(1);   }
          100% { transform: scaleY(0.4); }
        }
      `}</style>
    </div>
  );
}
